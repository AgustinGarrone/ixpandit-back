import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
}

export class HealthComponentDto {
  @ApiProperty({
    enum: HealthStatus,
    description: 'Health status of the component',
    example: HealthStatus.UP,
  })
  status: HealthStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Additional detail when the component is down',
    example: 'timeout of 5000ms exceeded',
  })
  message?: string;
}

export class HealthResponseDto {
  @ApiProperty({
    enum: ['ok', 'error'],
    description: 'Overall health status of the application',
    example: 'ok',
  })
  status: 'ok' | 'error';

  @ApiProperty({
    type: HealthComponentDto,
    description: 'PostgreSQL database connectivity',
  })
  database: HealthComponentDto;

  @ApiProperty({
    type: HealthComponentDto,
    description: 'PokeAPI external service availability',
  })
  pokeapi: HealthComponentDto;

  @ApiProperty({
    type: HealthComponentDto,
    description: 'NestJS API process availability',
  })
  api: HealthComponentDto;
}
