import { Injectable } from '@nestjs/common';
import { LruTtlCache } from 'src/common/cache/lru-ttl.cache';
import {
  PokemonCatalogDetail,
  PokemonCatalogPage,
  PokemonCatalogResource,
  PokemonCatalogType,
} from '../../models/pokemon-catalog.model';
import { PokemonCatalogPort } from '../../ports/pokemon-catalog.port';
import { PokeApiCatalogAdapter } from './pokeapi-catalog.adapter';

const DEFAULT_TTL_MS = 43_200_000; // 12 hs
const DEFAULT_MAX_DETAILS = 300;
const DEFAULT_MAX_TYPES = 20;
const DEFAULT_MAX_PAGES = 30;
const MAX_PAGE_LIMIT_TO_CACHE = 100;
const CATALOG_INDEX_LIMIT_THRESHOLD = 1000;

@Injectable()
export class CachedPokeApiCatalogAdapter implements PokemonCatalogPort {
  private readonly ttlMs = Number(
    process.env.POKEAPI_CACHE_TTL_MS ?? DEFAULT_TTL_MS,
  );

  private readonly pageCache = new LruTtlCache<PokemonCatalogPage>(
    Number(process.env.POKEAPI_CACHE_MAX_PAGES ?? DEFAULT_MAX_PAGES),
    this.ttlMs,
  );

  private readonly catalogIndexCache = new LruTtlCache<PokemonCatalogPage>(
    1,
    this.ttlMs,
  );

  private readonly typeCache = new LruTtlCache<PokemonCatalogResource[]>(
    Number(process.env.POKEAPI_CACHE_MAX_TYPES ?? DEFAULT_MAX_TYPES),
    this.ttlMs,
  );

  private readonly detailCache = new LruTtlCache<PokemonCatalogDetail>(
    Number(process.env.POKEAPI_CACHE_MAX_DETAILS ?? DEFAULT_MAX_DETAILS),
    this.ttlMs,
  );

  private readonly typesListCache = new LruTtlCache<PokemonCatalogType[]>(
    1,
    this.ttlMs,
  );

  constructor(private readonly delegate: PokeApiCatalogAdapter) {}

  getPage(offset: number, limit: number): Promise<PokemonCatalogPage> {
    if (offset === 0 && limit >= CATALOG_INDEX_LIMIT_THRESHOLD) {
      return this.catalogIndexCache.getOrSet('catalog:index', () =>
        this.delegate.getPage(offset, limit),
      );
    }

    if (limit > MAX_PAGE_LIMIT_TO_CACHE) {
      return this.delegate.getPage(offset, limit);
    }

    return this.pageCache.getOrSet(`page:${offset}:${limit}`, () =>
      this.delegate.getPage(offset, limit),
    );
  }

  findByType(type: string): Promise<PokemonCatalogResource[]> {
    const cacheKey = `type:${type.toLowerCase()}`;

    return this.typeCache.getOrSet(cacheKey, () =>
      this.delegate.findByType(type),
    );
  }

  getDetail(url: string): Promise<PokemonCatalogDetail> {
    return this.detailCache.getOrSet(url, () => this.delegate.getDetail(url));
  }

  getTypes(): Promise<PokemonCatalogType[]> {
    return this.typesListCache.getOrSet('types:all', () =>
      this.delegate.getTypes(),
    );
  }
}
