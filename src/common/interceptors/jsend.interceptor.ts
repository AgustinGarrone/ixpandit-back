import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  isPaginatedData,
  JSendStatus,
  JSendSuccess,
} from '../types/jsend.types';

@Injectable()
export class JSendInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response: JSendSuccess<T>) => {
        const { data, message, meta, status } = response;

        if (isPaginatedData(data)) {
          return {
            status: status ?? JSendStatus.SUCCESS,
            data: data.items,
            message,
            meta: {
              timestamp: new Date().toISOString(),
              pagination: data.pagination,
              ...meta,
            },
          };
        }

        return {
          status: status ?? JSendStatus.SUCCESS,
          data,
          message,
          meta: {
            timestamp: new Date().toISOString(),
            ...meta,
          },
        };
      }),
    );
  }
}
