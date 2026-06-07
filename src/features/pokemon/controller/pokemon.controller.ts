import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/features/auth/jwt/jwt-auth-guard';
import {
  JSendFailResponseDto,
  JSendPokemonListResponseDto,
  JSendPokemonResponseDto,
  JSendPokemonTypesResponseDto,
} from 'src/common/types/jsend.swagger.dto';
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
  @ApiOperation({
    summary: 'List Pokemon types',
    description:
      'Returns all Pokemon types from PokeAPI. Useful for building type filters in the frontend.',
  })
  @ApiOkResponse({
    type: JSendPokemonTypesResponseDto,
    description: 'Pokemon types retrieved successfully',
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
  @ApiOperation({
    summary: 'Get a random Pokemon',
    description:
      'Picks a random Pokemon from the full PokeAPI catalog and returns its detail. Requires authentication.',
  })
  @ApiOkResponse({
    type: JSendPokemonResponseDto,
    description: 'Random Pokemon detail retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    type: JSendFailResponseDto,
    description: 'Missing or invalid JWT',
  })
  async getRandom(): Promise<JSendSuccess<PokemonResponseDto>> {
    const pokemon = await this.pokemonService.getRandom();

    return {
      data: pokemon,
      message: 'Random Pokemon fetched successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List Pokemon with pagination and filters',
    description:
      'Returns a paginated Pokemon catalog from PokeAPI. Supports optional filters by type and partial name match.',
  })
  @ApiOkResponse({
    type: JSendPokemonListResponseDto,
    description: 'Paginated Pokemon list retrieved successfully',
  })
  @ApiBadRequestResponse({
    type: JSendFailResponseDto,
    description: 'Invalid query parameters',
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
