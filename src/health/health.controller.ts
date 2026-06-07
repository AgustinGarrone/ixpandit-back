import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JSendHealthResponseDto } from 'src/common/types/jsend.swagger.dto';
import { JSendSuccess } from 'src/common/types/jsend.types';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Check application health',
    description:
      'Verifies database connectivity, PokeAPI availability and API process status. Returns 503 if any dependency is down.',
  })
  @ApiOkResponse({
    type: JSendHealthResponseDto,
    description: 'All components are healthy',
  })
  @ApiServiceUnavailableResponse({
    type: JSendHealthResponseDto,
    description: 'One or more components are unavailable',
  })
  async check(
    @Res({ passthrough: true }) response: Response,
  ): Promise<JSendSuccess<HealthResponseDto>> {
    const health = await this.healthService.check();

    if (health.status === 'error') {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
    }

    return {
      data: health,
      message:
        health.status === 'ok'
          ? 'All systems operational'
          : 'One or more systems unavailable',
    };
  }
}
