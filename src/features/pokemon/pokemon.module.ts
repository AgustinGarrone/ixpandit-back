import { Module } from '@nestjs/common';
import { PokeApiCatalogAdapter } from './external/adapters/pokeapi-catalog.adapter';
import { PokemonController } from './controller/pokemon.controller';
import { PokeApiClient } from './external/pokeapi.client';
import { POKEMON_CATALOG_PORT } from './ports/pokemon-catalog.port';
import { PokemonService } from './service/pokemon.service';

@Module({
  controllers: [PokemonController],
  providers: [
    PokeApiClient,
    {
      provide: POKEMON_CATALOG_PORT,
      useClass: PokeApiCatalogAdapter,
    },
    PokemonService,
  ],
  exports: [PokemonService],
})
export class PokemonModule {}
