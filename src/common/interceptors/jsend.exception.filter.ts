import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JSendStatus } from '../types/jsend.types';

@Catch()
export class JSendExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const error = exception.getResponse();
      const message =
        status === Number(HttpStatus.TOO_MANY_REQUESTS)
          ? 'Too many requests. Please try again later.'
          : typeof error === 'string'
            ? error
            : (error as { message?: string | string[] }).message;

      return response.status(status).json({
        status: status < 500 ? JSendStatus.FAIL : JSendStatus.ERROR,
        message,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: 'Internal server error',
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}
