import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JSendSuccess } from 'src/common/types/jsend.types';
import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({
    description: 'All components are healthy',
    type: JSendSuccess<HealthResponseDto>,
  })
  @ApiServiceUnavailableResponse({
    description: 'One or more components are unavailable',
    type: JSendSuccess<HealthResponseDto>,
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
