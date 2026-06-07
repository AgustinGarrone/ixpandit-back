import { Injectable } from '@nestjs/common';
import type { FavoritePokemon } from '.prisma/client';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { PrismaService } from 'src/config/database/prisma.service';

@Injectable()
export class FavoritePokemonRepository extends BaseRepository<FavoritePokemon> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.favoritePokemon);
  }

  findByUserAndPokeapiId(
    userId: string,
    pokeapiId: number,
  ): Promise<FavoritePokemon | null> {
    return this.prisma.favoritePokemon.findUnique({
      where: {
        userId_pokeapiId: { userId, pokeapiId },
      },
    });
  }

  createFavorite(data: {
    userId: string;
    pokeapiId: number;
    name: string;
    imageUrl: string;
    type: string;
    abilities: string[];
  }): Promise<FavoritePokemon> {
    return this.prisma.favoritePokemon.create({ data });
  }

  deleteFavorite(userId: string, pokeapiId: number): Promise<FavoritePokemon> {
    return this.prisma.favoritePokemon.delete({
      where: {
        userId_pokeapiId: { userId, pokeapiId },
      },
    });
  }

  findByUserPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: FavoritePokemon[]; total: number }> {
    const skip = (page - 1) * limit;

    return Promise.all([
      this.prisma.favoritePokemon.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { pokeapiId: 'asc' },
      }),
      this.prisma.favoritePokemon.count({ where: { userId } }),
    ]).then(([items, total]) => ({ items, total }));
  }
}
