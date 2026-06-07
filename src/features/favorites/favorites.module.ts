import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { FavoritesController } from './controller/favorites.controller';
import { FavoritePokemonRepository } from './repositories/favorite-pokemon.repository';
import { FavoritesService } from './service/favorites.service';

@Module({
  imports: [DatabaseModule, AuthModule, PokemonModule],
  controllers: [FavoritesController],
  providers: [FavoritesService, FavoritePokemonRepository],
})
export class FavoritesModule {}
