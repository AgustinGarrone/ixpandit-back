import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/features/auth/jwt/jwt-auth-guard';
import {
  ListPokemonQueryDto,
  PokemonResponseDto,
  PokemonTypeResponseDto,
} from '../dto/list-pokemon.dto';
import { PokemonService } from '../service/pokemon.service';
import { JSendSuccess, PaginatedData } from '../../../common/types/jsend.types';

@ApiTags('Pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get('types')
  @ApiOkResponse({
    description: 'List of Pokemon types from PokeAPI',
    type: JSendSuccess<PokemonTypeResponseDto[]>,
  })
  async getTypes(): Promise<JSendSuccess<PokemonTypeResponseDto[]>> {
    const types = await this.pokemonService.getTypes();

    return {
      data: types,
      message: 'Pokemon types fetched successfully',
    };
  }

  @Get('random')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Random Pokemon from the full PokeAPI catalog',
    type: JSendSuccess<PokemonResponseDto>,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  async getRandom(): Promise<JSendSuccess<PokemonResponseDto>> {
    const pokemon = await this.pokemonService.getRandom();

    return {
      data: pokemon,
      message: 'Random Pokemon fetched successfully',
    };
  }

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
