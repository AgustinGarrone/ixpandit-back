import { Injectable } from '@nestjs/common';
import { HttpHealthIndicator, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from 'src/config/database/prisma.service';
import {
  HealthComponentDto,
  HealthResponseDto,
  HealthStatus,
} from './dto/health-response.dto';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

@Injectable()
export class HealthService {
  private readonly pokeApiHealthUrl: string;

  constructor(
    private readonly http: HttpHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
  ) {
    const baseUrl = process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2';

    this.pokeApiHealthUrl = `${baseUrl}/pokemon?limit=1`;
  }

  async check(): Promise<HealthResponseDto> {
    const [database, pokeapi] = await Promise.all([
      this.runCheck(() =>
        this.prismaHealth.pingCheck('database', this.prisma, {
          timeout: HEALTH_CHECK_TIMEOUT_MS,
        }),
      ),
      this.runCheck(() =>
        this.http.pingCheck('pokeapi', this.pokeApiHealthUrl, {
          timeout: HEALTH_CHECK_TIMEOUT_MS,
        }),
      ),
    ]);

    const api: HealthComponentDto = { status: HealthStatus.UP };
    const components = [database, pokeapi, api];
    const isHealthy = components.every(
      (component) => component.status === HealthStatus.UP,
    );

    return {
      status: isHealthy ? 'ok' : 'error',
      database,
      pokeapi,
      api,
    };
  }

  private async runCheck(
    check: () => Promise<Record<string, { status: string; message?: string }>>,
  ): Promise<HealthComponentDto> {
    try {
      const result = await check();
      const entry = Object.values(result)[0];

      if (entry.status === 'up') {
        return { status: HealthStatus.UP };
      }

      return {
        status: HealthStatus.DOWN,
        message: entry.message,
      };
    } catch (error) {
      return {
        status: HealthStatus.DOWN,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }
}
