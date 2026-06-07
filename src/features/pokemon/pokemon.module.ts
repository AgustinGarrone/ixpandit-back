import { Module } from '@nestjs/common';
import { CachedPokeApiCatalogAdapter } from './external/adapters/cached-pokeapi-catalog.adapter';
import { PokeApiCatalogAdapter } from './external/adapters/pokeapi-catalog.adapter';
import { PokemonController } from './controller/pokemon.controller';
import { PokeApiClient } from './external/pokeapi.client';
import { POKEMON_CATALOG_PORT } from './ports/pokemon-catalog.port';
import { PokemonService } from './service/pokemon.service';

@Module({
  controllers: [PokemonController],
  providers: [
    PokeApiClient,
    PokeApiCatalogAdapter,
    {
      provide: POKEMON_CATALOG_PORT,
      useClass: CachedPokeApiCatalogAdapter,
    },
    PokemonService,
  ],
  exports: [PokemonService, POKEMON_CATALOG_PORT],
})
export class PokemonModule {}
