export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiNamedResource[];
}

export interface PokeApiTypePokemonEntry {
  pokemon: PokeApiNamedResource;
  slot: number;
}

export interface PokeApiTypeResponse {
  id: number;
  name: string;
  pokemon: PokeApiTypePokemonEntry[];
}

export interface PokeApiPokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  types: {
    slot: number;
    type: PokeApiNamedResource;
  }[];
  abilities: {
    is_hidden: boolean;
    slot: number;
    ability: PokeApiNamedResource;
  }[];
}

export interface PokeApiTypeDetail {
  id: number;
  name: string;
}

export interface PokeApiAbilityDetail {
  id: number;
  name: string;
}
