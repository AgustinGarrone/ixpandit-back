import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppLoggerService } from '../logging/app-logger.service';
import { JSendStatus } from '../types/jsend.types';

type RequestWithUser = Request & {
  id?: string;
  user?: { userId: string; username: string };
};

@Catch()
@Injectable()
export class JSendExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('JSendExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithUser>();
    const response = ctx.getResponse<Response>();
    const requestId = request.id;
    const baseMeta = {
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const error = exception.getResponse();
      const message =
        status === Number(HttpStatus.TOO_MANY_REQUESTS)
          ? 'Too many requests. Please try again later.'
          : typeof error === 'string'
            ? error
            : (error as { message?: string | string[] }).message;

      this.logHttpException(exception, request, status, message);

      return response.status(status).json({
        status: status < 500 ? JSendStatus.FAIL : JSendStatus.ERROR,
        message,
        meta: baseMeta,
      });
    }

    this.logger.error('Unhandled exception', {
      requestId,
      method: request.method,
      url: request.originalUrl,
      userId: request.user?.userId,
      stack: exception instanceof Error ? exception.stack : undefined,
      error: exception instanceof Error ? exception.message : 'Unknown error',
    });

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: JSendStatus.ERROR,
      message: 'Internal server error',
      meta: baseMeta,
    });
  }

  private logHttpException(
    exception: HttpException,
    request: RequestWithUser,
    status: number,
    message: string | string[] | undefined,
  ): void {
    const logMeta = {
      requestId: request.id,
      method: request.method,
      url: request.originalUrl,
      userId: request.user?.userId,
      statusCode: status,
      message,
    };

    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error('HTTP exception', {
        ...logMeta,
        stack: exception.stack,
      });
      return;
    }

    this.logger.warn('HTTP exception', logMeta);
  }
}
