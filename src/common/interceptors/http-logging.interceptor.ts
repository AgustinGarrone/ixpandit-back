import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLoggerService } from '../logging/app-logger.service';

type RequestWithUser = Request & {
  id?: string;
  user?: { userId: string; username: string };
};

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HttpLoggingInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, originalUrl } = request;
    const requestId = request.id;
    const userId = request.user?.userId;
    const startedAt = Date.now();

    this.logger.info('Incoming request', {
      requestId,
      method,
      url: originalUrl,
      userId,
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();

        this.logger.info('Request completed', {
          requestId,
          method,
          url: originalUrl,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          userId,
        });
      }),
      catchError((error: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        const statusCode =
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof (error as { status: unknown }).status === 'number'
            ? (error as { status: number }).status
            : response.statusCode;

        this.logger.warn('Request failed', {
          requestId,
          method,
          url: originalUrl,
          statusCode,
          durationMs: Date.now() - startedAt,
          userId,
          error:
            error instanceof Error ? error.message : 'Unknown request error',
        });

        return throwError(() => error);
      }),
    );
  }
}
