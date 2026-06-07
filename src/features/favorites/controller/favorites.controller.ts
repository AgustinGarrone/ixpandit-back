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
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/features/auth/jwt/jwt-auth-guard';
import type { JwtUser } from 'src/features/auth/types/jwt-user.type';
import { GetUserFromJwt } from 'src/helpers/getUser.helper';
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
  @ApiOkResponse({
    description: 'Paginated list of favorite Pokemon for the authenticated user',
    type: JSendSuccess<PaginatedData<PokemonResponseDto>>,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests to list favorites',
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
  @ApiBody({ type: AddFavoriteDto })
  @ApiCreatedResponse({
    description: 'Pokemon added to favorites',
    type: JSendSuccess<PokemonResponseDto>,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiConflictResponse({ description: 'Pokemon is already in favorites' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests to add favorite',
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
  @ApiParam({
    name: 'pokeapiId',
    type: Number,
    description: 'PokeAPI numeric id of the Pokemon to remove from favorites',
    example: 25,
  })
  @ApiOkResponse({
    description: 'Favorite removal result',
    type: JSendSuccess<RemoveFavoriteResponseDto>,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests to remove favorite',
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
