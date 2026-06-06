export interface PokemonCatalogResource {
  name: string;
  url: string;
}

export interface PokemonCatalogPage {
  resources: PokemonCatalogResource[];
  total: number;
}

export interface PokemonCatalogDetail {
  id: number;
  name: string;
  imageUrl: string;
  type: string;
  abilities: string[];
}

export interface PokemonCatalogType {
  name: string;
  slug: string;
}
