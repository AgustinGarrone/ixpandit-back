-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "initialPokemons" BOOLEAN DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_pokemon" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pokeapiId" INTEGER NOT NULL,

    CONSTRAINT "favorite_pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_pokemon" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pokeapiId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,

    CONSTRAINT "team_pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_pokemon_userId_pokeapiId_key" ON "favorite_pokemon"("userId", "pokeapiId");

-- CreateIndex
CREATE UNIQUE INDEX "team_pokemon_userId_pokeapiId_key" ON "team_pokemon"("userId", "pokeapiId");

-- CreateIndex
CREATE UNIQUE INDEX "team_pokemon_userId_slot_key" ON "team_pokemon"("userId", "slot");

-- AddForeignKey
ALTER TABLE "favorite_pokemon" ADD CONSTRAINT "favorite_pokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemon" ADD CONSTRAINT "team_pokemon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
