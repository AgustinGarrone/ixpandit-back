import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function getCorsConfig(): CorsOptions {
  const allowedOrigin = process.env.CORS_ORIGIN ?? '*';

  if (!allowedOrigin) {
    throw new Error('CORS_ORIGIN environment variable is required');
  }

  return {
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  };
}
