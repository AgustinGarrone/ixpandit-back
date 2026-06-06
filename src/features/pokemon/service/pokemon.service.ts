import { Inject, Injectable } from '@nestjs/common';
import {
  ListPokemonQueryDto,
  PokemonResponseDto,
} from '../dto/list-pokemon.dto';
import { PaginatedData } from 'src/common/types/jsend.types';
import { PokemonCatalogResource } from '../models/pokemon-catalog.model';
import {
  POKEMON_CATALOG_PORT,
  type PokemonCatalogPort,
} from '../ports/pokemon-catalog.port';

@Injectable()
export class PokemonService {
  constructor(
    @Inject(POKEMON_CATALOG_PORT)
    private readonly pokemonCatalog: PokemonCatalogPort,
  ) {}

  async findAll(
    filters: ListPokemonQueryDto,
  ): Promise<PaginatedData<PokemonResponseDto>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const { nameLike, type } = filters;

    if (!type && !nameLike) {
      return this.findAllPaginatedFromApi(page, limit);
    }

    const resources = await this.resolveFilteredResources(type, nameLike);
    const total = resources.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const pageResources = resources.slice(offset, offset + limit);

    const items = await Promise.all(
      pageResources.map((resource) =>
        this.pokemonCatalog.getDetail(resource.url),
      ),
    );

    return {
      items,
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

  private async findAllPaginatedFromApi(
    page: number,
    limit: number,
  ): Promise<PaginatedData<PokemonResponseDto>> {
    const offset = (page - 1) * limit;
    const catalogPage = await this.pokemonCatalog.getPage(offset, limit);
    const totalPages = Math.ceil(catalogPage.total / limit);

    const items = await Promise.all(
      catalogPage.resources.map((resource) =>
        this.pokemonCatalog.getDetail(resource.url),
      ),
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total: catalogPage.total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private async resolveFilteredResources(
    type?: string,
    nameLike?: string,
  ): Promise<PokemonCatalogResource[]> {
    let resources: PokemonCatalogResource[];

    if (type) {
      resources = await this.pokemonCatalog.findByType(type);
    } else {
      const catalogPage = await this.pokemonCatalog.getPage(0, 10000);
      resources = catalogPage.resources;
    }

    if (nameLike) {
      const search = nameLike.toLowerCase();
      resources = resources.filter((resource) =>
        resource.name.toLowerCase().includes(search),
      );
    }

    return resources;
  }
}
