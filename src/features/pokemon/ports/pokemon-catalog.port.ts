import {
  PokemonCatalogDetail,
  PokemonCatalogPage,
  PokemonCatalogResource,
  PokemonCatalogType,
} from '../models/pokemon-catalog.model';

export const POKEMON_CATALOG_PORT = 'POKEMON_CATALOG_PORT';

export interface PokemonCatalogPort {
  getPage(offset: number, limit: number): Promise<PokemonCatalogPage>;
  findByType(type: string): Promise<PokemonCatalogResource[]>;
  getDetail(url: string): Promise<PokemonCatalogDetail>;
  getTypes(): Promise<PokemonCatalogType[]>;
}
