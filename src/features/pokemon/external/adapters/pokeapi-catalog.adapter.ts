import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isAxiosError } from 'axios';
import { PokeApiClient } from '../pokeapi.client';
import {
  PokemonCatalogDetail,
  PokemonCatalogPage,
  PokemonCatalogResource,
  PokemonCatalogType,
} from '../../models/pokemon-catalog.model';
import { PokemonCatalogPort } from '../../ports/pokemon-catalog.port';

@Injectable()
export class PokeApiCatalogAdapter implements PokemonCatalogPort {
  constructor(private readonly pokeApiClient: PokeApiClient) {}

  async getPage(offset: number, limit: number): Promise<PokemonCatalogPage> {
    const response = await this.pokeApiClient.getPokemonList(offset, limit);

    return {
      resources: response.results.map((resource) => ({
        name: resource.name,
        url: resource.url,
      })),
      total: response.count,
    };
  }

  async findByType(type: string): Promise<PokemonCatalogResource[]> {
    try {
      const response = await this.pokeApiClient.getPokemonByType(type);

      return response.pokemon.map((entry) => ({
        name: entry.pokemon.name,
        url: entry.pokemon.url,
      }));
    } catch (error) {
      this.handlePokeApiError(error, `Pokemon type "${type}" not found`);
    }
  }

  async getDetail(url: string): Promise<PokemonCatalogDetail> {
    const detail = await this.pokeApiClient.getPokemonDetail(url);

    const [types, abilities] = await Promise.all([
      Promise.all(
        detail.types.map((entry) =>
          this.pokeApiClient.getTypeDetail(entry.type.url),
        ),
      ),
      Promise.all(
        detail.abilities.map((entry) =>
          this.pokeApiClient.getAbilityDetail(entry.ability.url),
        ),
      ),
    ]);

    return {
      id: detail.id,
      name: this.formatName(detail.name),
      imageUrl: detail.sprites.front_default ?? '',
      type: types.map((entry) => this.formatName(entry.name)).join(', '),
      abilities: abilities.map((entry) => this.formatName(entry.name)),
    };
  }

  async getTypes(): Promise<PokemonCatalogType[]> {
    const response = await this.pokeApiClient.getTypes();

    return response.results
      .map((entry) => ({
        name: this.formatName(entry.name),
        slug: entry.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private formatName(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private handlePokeApiError(error: unknown, notFoundMessage: string): never {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundException(notFoundMessage);
    }

    throw new ServiceUnavailableException('PokeAPI is unavailable');
  }
}
