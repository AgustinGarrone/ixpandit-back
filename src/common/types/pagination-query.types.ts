import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationRequestQuery {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts at 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The "page" field must be an integer.' })
  @Min(1, { message: 'The "page" field must be at least 1.' })
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'The "limit" field must be an integer.' })
  @Min(1, { message: 'The "limit" field must be at least 1.' })
  limit?: number;
}
