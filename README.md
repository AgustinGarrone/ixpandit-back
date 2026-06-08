# ixp-pok-back

Backend de la prueba técnica Pokémon — NestJS, PostgreSQL y PokeAPI.

---

## Por qué está hecho así

> La idea es empezar mostrando el razonamiento, antes de hablar de endpoints o de cómo levantarlo.

### El servicio semilla (la primera idea)

Primero quise hacer que el backend use un **servicio semilla** para poblar la base de datos. Al ser un catálogo casi estático el de PokeAPI, así evitaba depender de un servicio externo en cada request y lograba persistir los datos como los quería porque además, las respuestas de la PokeAPI **no satisfacen con una sola consulta** los parámetros que requería el front — hay que combinar listado, detalle, tipos, filtros, etc.

### Por qué no seguí por ahí

Pero la consigna pedía que consumamos **directo de la PokeAPI, sin wrappers**. Sembrar todo en DB terminaba siendo justamente eso: una capa intermedia que ocultaba el origen de los datos. Pensé mejor usarlo como servicio directo.

### Lo que hice en cambio

Entonces hice un servicio que la consulta, usando el patrón **Port & Adapter** — que básicamente es no depender de una implementación concreta. Abstraje la capa del cliente para que si el día de mañana dejamos de usar PokeAPI y usamos otra fuente, esto se haría mas fácil **cambiando el adaptador**.

```
PokemonService  →  PokemonCatalogPort (interfaz)
                         ↑
              CachedPokeApiCatalogAdapter  (decorador)
                         ↓
              PokeApiCatalogAdapter        (implementación)
                         ↓
                   PokeApiClient
```

### Caché y servicio degradado

También implementé **caché a nivel local** para:

- evitar llamadas excesivas a la PokeAPI,
- ser más eficiente con los tiempos de respuesta,
- y, por si el servicio de la PokeAPI se cae, poder brindar un **servicio degradado** (lo que ya esté cacheado sigue respondiendo).

Configurable por env — ver `.env.example`:

| Variable                    | Default | Qué cachea        |
| --------------------------- | ------- | ----------------- |
| `POKEAPI_CACHE_TTL_MS`      | 12 h    | TTL general       |
| `POKEAPI_CACHE_MAX_DETAILS` | 300     | Detalles por URL  |
| `POKEAPI_CACHE_MAX_PAGES`   | 30      | Páginas paginadas |
| `POKEAPI_CACHE_MAX_TYPES`   | 20      | Filtros por tipo  |

la caché cuenta con un sistema LRU (Least Recently Used) para no ocupar mucha ram.. si se llena la cantidad maxima que le seteamos de caché, saca la clave que se usó hace más tiempo. Esto porque mi objetivo era desplegarlo en AWS para agilizarles pruebas y en una t3.small que fue la que elegí, para levantar los servicios no es que estaba sobrado.

### Dónde quedó la persistencia

El catálogo vive en PokeAPI en tiempo real. La DB guarda lo propio de la app: usuarios y favoritos con **snapshot** (`name`, `imageUrl`, `type`, `abilities`) al momento de guardarlos.

### Autenticación

Metí auth con **JWT** y un solo **token de acceso**. Si bien lo recomendado para estos casos es contar con 2 tokens (access + refresh), por temas de tiempo y para no hacer sobreingeniería lo dejé así.

El token viaja en el **cuerpo de la respuesta** (login/register) y el cliente lo guarda en `localStorage`. En un entorno productivo lo haría en una **cookie `httpOnly`**, para que no pueda ser manipulado desde JavaScript del cliente.

Las rutas protegidas (favoritos, Pokémon aleatorio, etc.) lo esperan en el header `Authorization: Bearer <token>`.

### Respuestas con JSend

Para la gestión de respuestas de la API usé **[JSend](https://github.com/omniti-labs/jsend)**, un estándar que unifica el formato de éxito y error. Todas las respuestas siguen la misma estructura:

Lo implementé con un interceptor global (`JSendInterceptor`) y un exception filter (`JSendExceptionFilter`) para que controllers y errores hablen el mismo idioma.

### Logging con Pino

Para logging usé **Pino** (`nestjs-pino`): logs estructurados en JSON a stdout, con contexto por request.

- Cada request lleva un **`requestId`** que se propaga en los logs y en el `meta` de las respuestas JSend.
- `HttpLoggingInterceptor` registra entrada, salida, duración y `userId` cuando hay JWT.
- El adapter de PokeAPI y el exception filter también loguean errores con el mismo `requestId`, lo que facilita **trazar una request de punta a punta** cuando algo falla.

Configurable con `LOG_LEVEL` en `.env`.

### Health check

Hay un endpoint de health importante: **`GET /health`** (fuera del prefijo `/api/v1`, excluido del throttling).

Usa **NestJS Terminus** y reporta el estado de cada dependencia por separado:

| Componente | Qué verifica |
|------------|--------------|
| `api` | Que el proceso Nest responde |
| `database` | Conectividad con PostgreSQL (Prisma ping) |
| `pokeapi` | Que PokeAPI responde (ping a `/pokemon?limit=1`) |

Si alguno está caído, responde **503** con el detalle en formato JSend. Sirve para monitoreo en deploy (Docker, ECS, ALB target health) y para saber si estás sirviendo catálogo en vivo o solo desde caché cuando PokeAPI falla.

---
## Arquitectura

NestJS actúa como **Backend for Frontend (BFF)**: es el único punto de entrada del frontend (Next.js). El cliente no habla directo con PokeAPI ni con PostgreSQL; todo pasa por esta capa, que adapta las respuestas al contrato que necesita el front (formato **JSend**: `status`, `data`, `message`, `meta`).

### Aplicación (módulos)

![Diagrama de arquitectura de la app](./docs/arquitectura.png)

| Módulo        | Responsabilidad                          | Depende de                       |
| ------------- | ---------------------------------------- | -------------------------------- |
| **Auth**      | Registro, login, JWT                     | PostgreSQL (usuarios)            |
| **Pokemon**   | Catálogo en vivo: listado, tipos, random | PokeAPI vía caché in-memory      |
| **Favorites** | CRUD de favoritos del usuario            | PostgreSQL (snapshot persistido) |

- **PokemonModule → PokeAPI**: catálogo en tiempo real. La caché (**LRU + TTL**) vive dentro de este módulo, en RAM del proceso.
- **FavoritesModule ⇢ PokemonModule** (solo en `POST /favorites`): consulta el detalle para armar el snapshot antes de persistir en DB.

### Despliegue actual: EC2 + RDS

Lo levanté en una **EC2** (`t3.small`) con el backend en Docker y la base en **RDS PostgreSQL**. El front va en la misma EC2 detrás de nginx, que actúa como reverse proxy hacia el API.

Este setup alcanza para la prueba técnica: **una sola instancia** del backend, sin necesidad de coordinar estado entre réplicas.

### Propuesta cloud (si fuera más productivo)

Si el tráfico creciera o quisiera **escalar horizontalmente**, un enfoque posible sería migrar a **ECS** con subnets públicas/privadas, **ALB** como entrada, **NAT Gateway** para que el BFF (en subnet privada) salga a PokeAPI, **RDS** y **ElastiCache (Redis)** en subnet de datos:

![Arquitectura cloud propuesta en AWS](./docs/arquitectura-aws.png)

> El browser consume el BFF vía `/api` a través del ALB (mismo dominio). No hace falta flecha directa Front → BFF entre containers: las requests las hace el cliente.

### Limitación actual: caché y throttling en memoria local

Hoy tanto la **caché de PokeAPI** (`LruTtlCache` en RAM) como el **rate limiting** (`@nestjs/throttler`, contadores en memoria del proceso) funcionan **a nivel local de cada instancia**.

Eso está bien con **1 réplica** (EC2 única). En caso de querer escalar horizontalmente deberíamos modificar la forma de uso de la caché hacia un servicio distribuido como elasticaché y asociar el estrangulamiento a esa caché o utilizar otro recurso como un Web application firewall

Por eso en el diagrama cloud Redis no es decorativo: es el paso necesario para que caché y throttling sigan siendo efectivos con **escalado horizontal**.

---

## Stack

- **NestJS 11** — framework
- **Prisma + PostgreSQL** — persistencia (usuarios, favoritos)
- **Passport JWT** — autenticación
- **PokeAPI** — catálogo en tiempo real
- **Terminus** — health checks
- **JSend** — formato estándar de respuestas API
- **Pino** — logging estructurado con tracing por `requestId`
- **Swagger** — documentación en `/api/v1/docs`
- **Docker** — despliegue

---

## Cómo levantarlo

### Desarrollo local (con Docker)

```bash
cp .env.example .env
docker compose up --build
```

| Servicio   | URL                               |
| ---------- | --------------------------------- |
| API        | http://localhost:8100             |
| Swagger    | http://localhost:8100/api/v1/docs |
| Health     | http://localhost:8100/health      |
| PostgreSQL | localhost:5432                    |

Las migraciones Prisma se aplican solas al arrancar el contenedor (`prisma migrate deploy` en el entrypoint del `Dockerfile`).

### Desarrollo local (sin Docker)

```bash
npm install
cp .env.example .env   # apuntar DATABASE_URL a tu Postgres local
npm run prisma:migrate
npm run start:dev
```

Variables mínimas en `.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3000
APP_PORT=8100
```

Ver `.env.example` para throttling, logging y configuración de caché.

---

## Despliegue (EC2 + RDS)

En producción la base va en **RDS PostgreSQL**; la EC2 corre solo el backend (y el front detrás de nginx).

```bash
docker build -t ixp-pok-back .
docker run -d \
  --name ixp-pok-api \
  --restart unless-stopped \
  -p 127.0.0.1:8100:8100 \
  --env-file .env.prod \
  ixp-pok-back
```

`.env.prod` mínimo:

```env
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/gts-pokemon-db?sslmode=require
JWT_SECRET=...
CORS_ORIGIN=http://TU_IP_O_DOMINIO
APP_PORT=8100
NODE_ENV=production
```

Ver `docker-compose.prod.example.yml` para referencia.

---

## Endpoints principales

| Método | Ruta                           | Auth | Descripción                        |
| ------ | ------------------------------ | ---- | ---------------------------------- |
| POST   | `/api/v1/auth/register`        | —    | Registro                           |
| POST   | `/api/v1/auth/login`           | —    | Login → JWT                        |
| GET    | `/api/v1/pokemon`              | —    | Listado paginado + filtro por tipo |
| GET    | `/api/v1/pokemon/types`        | —    | Tipos disponibles                  |
| GET    | `/api/v1/pokemon/random`       | JWT  | Pokémon aleatorio                  |
| GET    | `/api/v1/favorites`            | JWT  | Favoritos del usuario              |
| POST   | `/api/v1/favorites`            | JWT  | Agregar favorito                   |
| DELETE | `/api/v1/favorites/:pokeapiId` | JWT  | Quitar favorito                    |
| GET    | `/health`                      | —    | Estado DB + PokeAPI                |

Documentación interactiva: **http://localhost:8100/api/v1/docs**

---

## Testing

Me hubiera gustado meter **tests automatizados**, pero no llegué con los tiempos.

Lo que más priorizaría:

| Área                              | Qué probar                                                            | Por qué                                                         |
| --------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| **`PokeApiCatalogAdapter`**       | Mapeo de respuestas, errores 404/503, normalización al modelo interno | Es el punto de contacto con un servicio externo poco confiable  |
| **`CachedPokeApiCatalogAdapter`** | Cache hit/miss, TTL, delegación al adapter real                       | Asegura que la caché no devuelva basura ni oculte fallos reales |
| **`PokemonService`**              | Filtros, paginación, random                                           | Lógica de dominio que depende del port                          |

El adapter de PokeAPI es **crítico**: si falla el mapeo o el manejo de errores, se rompe todo el catálogo. Tests con mocks de axios/PokeAPI (unit) y, con más tiempo, contract tests contra la API real (integración).

---
