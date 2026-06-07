import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/features/auth/jwt/jwt-auth-guard';
import type { JwtUser } from 'src/features/auth/types/jwt-user.type';
import { GetUserFromJwt } from 'src/helpers/getUser.helper';
import {
  JSendFailResponseDto,
  JSendPokemonListResponseDto,
  JSendPokemonResponseDto,
  JSendRemoveFavoriteResponseDto,
} from 'src/common/types/jsend.swagger.dto';
import { JSendSuccess, PaginatedData } from 'src/common/types/jsend.types';
import { PokemonResponseDto } from 'src/features/pokemon/dto/list-pokemon.dto';
import {
  AddFavoriteDto,
  ListFavoritesQueryDto,
  RemoveFavoriteResponseDto,
} from '../dto/favorite.dto';
import { FavoritesService } from '../service/favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'List favorite Pokemon',
    description:
      'Returns the authenticated user favorites with pagination. Each item includes the Pokemon snapshot stored when it was favorited.',
  })
  @ApiOkResponse({
    type: JSendPokemonListResponseDto,
    description: 'Favorites retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    type: JSendFailResponseDto,
    description: 'Missing or invalid JWT',
  })
  @ApiTooManyRequestsResponse({
    type: JSendFailResponseDto,
    description: 'Too many requests',
  })
  async findAll(
    @GetUserFromJwt() user: JwtUser,
    @Query() query: ListFavoritesQueryDto,
  ): Promise<JSendSuccess<PaginatedData<PokemonResponseDto>>> {
    const data = await this.favoritesService.findAll(user.userId, query);

    return {
      data,
      message: 'Favorites fetched successfully',
    };
  }

  @Post()
  @ApiOperation({
    summary: 'Add Pokemon to favorites',
    description:
      'Fetches the Pokemon from PokeAPI, stores a snapshot in the database and associates it with the authenticated user.',
  })
  @ApiBody({ type: AddFavoriteDto })
  @ApiCreatedResponse({
    type: JSendPokemonResponseDto,
    description: 'Pokemon added to favorites',
  })
  @ApiUnauthorizedResponse({
    type: JSendFailResponseDto,
    description: 'Missing or invalid JWT',
  })
  @ApiConflictResponse({
    type: JSendFailResponseDto,
    description: 'Pokemon is already in favorites',
  })
  @ApiTooManyRequestsResponse({
    type: JSendFailResponseDto,
    description: 'Too many requests',
  })
  async addFavorite(
    @GetUserFromJwt() user: JwtUser,
    @Body() dto: AddFavoriteDto,
  ): Promise<JSendSuccess<PokemonResponseDto>> {
    const data = await this.favoritesService.addFavorite(
      user.userId,
      dto.pokeapiId,
    );

    return {
      data,
      message: 'Pokemon added to favorites',
    };
  }

  @Delete(':pokeapiId')
  @ApiOperation({
    summary: 'Remove Pokemon from favorites',
    description:
      'Removes a Pokemon from the authenticated user favorites. If it was not favorited, the operation completes without error.',
  })
  @ApiParam({
    name: 'pokeapiId',
    type: Number,
    description: 'PokeAPI numeric id of the Pokemon to remove from favorites',
    example: 25,
  })
  @ApiOkResponse({
    type: JSendRemoveFavoriteResponseDto,
    description: 'Favorite removal result',
  })
  @ApiUnauthorizedResponse({
    type: JSendFailResponseDto,
    description: 'Missing or invalid JWT',
  })
  @ApiTooManyRequestsResponse({
    type: JSendFailResponseDto,
    description: 'Too many requests',
  })
  async removeFavorite(
    @GetUserFromJwt() user: JwtUser,
    @Param('pokeapiId', ParseIntPipe) pokeapiId: number,
  ): Promise<JSendSuccess<RemoveFavoriteResponseDto>> {
    const data = await this.favoritesService.removeFavorite(
      user.userId,
      pokeapiId,
    );

    return {
      data,
      message: data.removed
        ? 'Pokemon removed from favorites'
        : 'Pokemon was not in favorites',
    };
  }
}
