import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { FavoritePokemon } from '.prisma/client';
import { PaginatedData } from 'src/common/types/jsend.types';
import { PokemonResponseDto } from 'src/features/pokemon/dto/list-pokemon.dto';
import {
  POKEMON_CATALOG_PORT,
  type PokemonCatalogPort,
} from 'src/features/pokemon/ports/pokemon-catalog.port';
import {
  ListFavoritesQueryDto,
  RemoveFavoriteResponseDto,
} from '../dto/favorite.dto';
import { FavoritePokemonRepository } from '../repositories/favorite-pokemon.repository';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly favoritePokemonRepository: FavoritePokemonRepository,
    @Inject(POKEMON_CATALOG_PORT)
    private readonly pokemonCatalog: PokemonCatalogPort,
  ) {}

  async findAll(
    userId: string,
    query: ListFavoritesQueryDto,
  ): Promise<PaginatedData<PokemonResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { items, total } =
      await this.favoritePokemonRepository.findByUserPaginated(
        userId,
        page,
        limit,
      );

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: items.map((favorite) => this.toPokemonResponse(favorite)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async addFavorite(
    userId: string,
    pokeapiId: number,
  ): Promise<PokemonResponseDto> {
    const existing =
      await this.favoritePokemonRepository.findByUserAndPokeapiId(
        userId,
        pokeapiId,
      );

    if (existing) {
      throw new ConflictException('Pokemon is already in favorites');
    }

    const detail = await this.pokemonCatalog.getDetail(
      this.buildPokemonUrl(pokeapiId),
    );

    const favorite = await this.favoritePokemonRepository.createFavorite({
      userId,
      pokeapiId: detail.id,
      name: detail.name,
      imageUrl: detail.imageUrl,
      type: detail.type,
      abilities: detail.abilities,
    });

    return this.toPokemonResponse(favorite);
  }

  async removeFavorite(
    userId: string,
    pokeapiId: number,
  ): Promise<RemoveFavoriteResponseDto> {
    const existing =
      await this.favoritePokemonRepository.findByUserAndPokeapiId(
        userId,
        pokeapiId,
      );

    if (!existing) {
      return { pokeapiId, removed: false };
    }

    await this.favoritePokemonRepository.deleteFavorite(userId, pokeapiId);

    return { pokeapiId, removed: true };
  }

  private buildPokemonUrl(pokeapiId: number): string {
    const baseUrl = process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2';

    return `${baseUrl}/pokemon/${pokeapiId}/`;
  }

  private toPokemonResponse(favorite: FavoritePokemon): PokemonResponseDto {
    return {
      id: favorite.pokeapiId,
      name: favorite.name,
      imageUrl: favorite.imageUrl,
      type: favorite.type,
      abilities: favorite.abilities,
    };
  }
}
