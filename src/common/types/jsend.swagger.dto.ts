import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoginResponseDto } from 'src/features/auth/dto/auth.dto';
import { RemoveFavoriteResponseDto } from 'src/features/favorites/dto/favorite.dto';
import {
  PokemonResponseDto,
  PokemonTypeResponseDto,
} from 'src/features/pokemon/dto/list-pokemon.dto';
import { HealthResponseDto } from 'src/health/dto/health-response.dto';
import { JSendStatus } from './jsend.types';

export class PaginationMetaDto {
  @ApiProperty({ type: Number, example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ type: Number, example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ type: Number, example: 1281, description: 'Total matching items' })
  total: number;

  @ApiProperty({ type: Number, example: 129, description: 'Total available pages' })
  totalPages: number;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether a next page exists',
  })
  hasNext: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Whether a previous page exists',
  })
  hasPrev: boolean;
}

export class JSendMetaDto {
  @ApiProperty({
    type: String,
    example: '2026-06-06T12:00:00.000Z',
    description: 'Response timestamp in ISO-8601 format',
  })
  timestamp: string;

  @ApiPropertyOptional({
    type: String,
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Correlation id for tracing logs and support',
  })
  requestId?: string;
}

export class JSendMetaWithPaginationDto extends JSendMetaDto {
  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata for list endpoints',
  })
  pagination: PaginationMetaDto;
}

export class JSendFailResponseDto {
  @ApiProperty({
    enum: [JSendStatus.FAIL, JSendStatus.ERROR],
    example: JSendStatus.FAIL,
    description: 'JSend failure status for client or server errors',
  })
  status: JSendStatus.FAIL | JSendStatus.ERROR;

  @ApiProperty({
    type: String,
    example: 'Validation failed',
    description: 'Human-readable error message',
  })
  message: string | string[];

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}

export class JSendAuthResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: LoginResponseDto })
  data: LoginResponseDto;

  @ApiProperty({
    type: String,
    example: 'User successfully logged in',
  })
  message: string;

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}

export class JSendPokemonTypesResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: [PokemonTypeResponseDto] })
  data: PokemonTypeResponseDto[];

  @ApiProperty({
    type: String,
    example: 'Pokemon types fetched successfully',
  })
  message: string;

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}

export class JSendPokemonResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: PokemonResponseDto })
  data: PokemonResponseDto;

  @ApiProperty({
    type: String,
    example: 'Random Pokemon fetched successfully',
  })
  message: string;

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}

export class JSendPokemonListResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: [PokemonResponseDto] })
  data: PokemonResponseDto[];

  @ApiProperty({
    type: String,
    example: 'Pokemon list fetched successfully',
  })
  message: string;

  @ApiProperty({ type: JSendMetaWithPaginationDto })
  meta: JSendMetaWithPaginationDto;
}

export class JSendRemoveFavoriteResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: RemoveFavoriteResponseDto })
  data: RemoveFavoriteResponseDto;

  @ApiProperty({
    type: String,
    example: 'Pokemon removed from favorites',
  })
  message: string;

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}

export class JSendHealthResponseDto {
  @ApiProperty({ enum: [JSendStatus.SUCCESS], example: JSendStatus.SUCCESS })
  status: JSendStatus.SUCCESS;

  @ApiProperty({ type: HealthResponseDto })
  data: HealthResponseDto;

  @ApiProperty({
    type: String,
    example: 'All systems operational',
  })
  message: string;

  @ApiProperty({ type: JSendMetaDto })
  meta: JSendMetaDto;
}
