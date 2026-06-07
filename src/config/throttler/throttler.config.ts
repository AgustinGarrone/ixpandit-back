import type { ThrottlerModuleOptions } from '@nestjs/throttler';

const DEFAULT_TTL_MS = 60_000;
const DEFAULT_LIMIT = 100;
const DEFAULT_AUTH_TTL_MS = 60_000;
const DEFAULT_AUTH_LIMIT = 10;

export const authThrottlerOptions = {
  limit: Number(process.env.THROTTLE_AUTH_LIMIT ?? DEFAULT_AUTH_LIMIT),
  ttl: Number(process.env.THROTTLE_AUTH_TTL_MS ?? DEFAULT_AUTH_TTL_MS),
};

export function getThrottlerConfig(): ThrottlerModuleOptions {
  return {
    setHeaders: true,
    throttlers: [
      {
        name: 'default',
        ttl: Number(process.env.THROTTLE_TTL_MS ?? DEFAULT_TTL_MS),
        limit: Number(process.env.THROTTLE_LIMIT ?? DEFAULT_LIMIT),
      },
    ],
  };
}
