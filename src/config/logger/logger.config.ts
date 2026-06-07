import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Params } from 'nestjs-pino';

const DEFAULT_LOG_LEVEL =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

export function getLoggerConfig(): Params {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL,
      autoLogging: false,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.email',
        ],
        remove: true,
      },
      genReqId: (req: IncomingMessage) => {
        const header = req.headers['x-request-id'];

        if (typeof header === 'string' && header.length > 0) {
          return header;
        }

        return randomUUID();
      },
      ...(isProduction
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
                translateTime: 'SYS:standard',
              },
            },
          }),
    },
  };
}
