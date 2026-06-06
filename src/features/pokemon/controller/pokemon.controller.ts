import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ListPokemonQueryDto,
  PokemonResponseDto,
} from '../dto/list-pokemon.dto';
import { PokemonService } from '../service/pokemon.service';
import { JSendSuccess, PaginatedData } from '../../../common/types/jsend.types';

@ApiTags('Pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOkResponse({
    description: 'List of Pokemon from PokeAPI',
    type: JSendSuccess<PaginatedData<PokemonResponseDto>>,
  })
  async findAll(
    @Query() query: ListPokemonQueryDto,
  ): Promise<JSendSuccess<PaginatedData<PokemonResponseDto>>> {
    const response = await this.pokemonService.findAll(query);

    return {
      data: response,
      message: 'Pokemon list fetched successfully',
    };
  }
}
