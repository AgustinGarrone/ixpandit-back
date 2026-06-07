import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { PaginationRequestQuery } from 'src/common/types/pagination-query.types';

export class ListFavoritesQueryDto extends PaginationRequestQuery {}

export class AddFavoriteDto {
  @ApiProperty({
    type: Number,
    description: 'PokeAPI numeric id of the Pokemon to favorite',
    example: 25,
    minimum: 1,
  })
  @IsInt({ message: 'The "pokeapiId" field must be an integer.' })
  @Min(1, { message: 'The "pokeapiId" field must be at least 1.' })
  pokeapiId: number;
}

export class RemoveFavoriteResponseDto {
  @ApiProperty({
    type: Number,
    description: 'PokeAPI numeric id of the Pokemon',
    example: 25,
  })
  pokeapiId: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the Pokemon was removed from favorites',
    example: true,
  })
  removed: boolean;
}
