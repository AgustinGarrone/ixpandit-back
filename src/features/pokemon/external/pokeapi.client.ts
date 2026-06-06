import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import {
  PokeApiAbilityDetail,
  PokeApiPaginatedResponse,
  PokeApiPokemonDetail,
  PokeApiTypeDetail,
  PokeApiTypeResponse,
} from './pokeapi.types';

@Injectable()
export class PokeApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    const baseURL = process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2';

    this.client = axios.create({
      baseURL,
      timeout: 10_000,
    });
  }

  getPokemonList(
    offset: number,
    limit: number,
  ): Promise<PokeApiPaginatedResponse> {
    return this.get<PokeApiPaginatedResponse>('/pokemon', {
      params: { offset, limit },
    });
  }

  getPokemonByType(type: string): Promise<PokeApiTypeResponse> {
    return this.get<PokeApiTypeResponse>(`/type/${type}`);
  }

  getPokemonDetail(url: string): Promise<PokeApiPokemonDetail> {
    return this.getByUrl<PokeApiPokemonDetail>(url);
  }

  getTypeDetail(url: string): Promise<PokeApiTypeDetail> {
    return this.getByUrl<PokeApiTypeDetail>(url);
  }

  getAbilityDetail(url: string): Promise<PokeApiAbilityDetail> {
    return this.getByUrl<PokeApiAbilityDetail>(url);
  }

  private getByUrl<T>(url: string): Promise<T> {
    return this.client.get<T>(url).then((response) => response.data);
  }

  private get<T>(
    path: string,
    config?: { params?: Record<string, number | string> },
  ): Promise<T> {
    return this.client.get<T>(path, config).then((response) => response.data);
  }
}
