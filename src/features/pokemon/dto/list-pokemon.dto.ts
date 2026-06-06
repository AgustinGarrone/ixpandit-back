import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationRequestQuery } from '../../../common/types/pagination-query.types';

export class ListPokemonQueryDto extends PaginationRequestQuery {
  @ApiPropertyOptional({
    type: String,
    description: 'Filter Pokemon by partial name match (case-insensitive)',
    example: 'char',
  })
  @IsOptional()
  @IsString({ message: 'The "nameLike" field must be a string.' })
  nameLike?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter Pokemon by type name (e.g. fire, water, grass)',
    example: 'fire',
  })
  @IsOptional()
  @IsString({ message: 'The "type" field must be a string.' })
  type?: string;
}

export class PokemonTypeResponseDto {
  @ApiProperty({
    type: String,
    description: 'Display name of the Pokemon type',
    example: 'Fire',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'Slug to use in the type filter query param',
    example: 'fire',
  })
  slug: string;
}

export class PokemonResponseDto {
  @ApiProperty({
    type: Number,
    description: 'The ID of the Pokemon',
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'The name of the Pokemon',
    example: 'Pikachu',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The URL of the Pokemon',
    example: 'https://pokeapi.co/api/v2/pokemon/1/',
  })
  imageUrl: string;

  @ApiProperty({
    type: String,
    description: 'The type of the Pokemon',
    example: 'Electric',
  })
  type: string;

  @ApiProperty({
    type: [String],
    description: 'The abilities of the Pokemon',
    example: ['Lightning Rod', 'Static'],
  })
  abilities: string[];
}
