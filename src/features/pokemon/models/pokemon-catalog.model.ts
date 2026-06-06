export interface PokemonCatalogResource {
  name: string;
  url: string;
}

export interface PokemonCatalogPage {
  resources: PokemonCatalogResource[];
  total: number;
}

export interface PokemonCatalogDetail {
  name: string;
  imageUrl: string;
  type: string;
  abilities: string[];
}
