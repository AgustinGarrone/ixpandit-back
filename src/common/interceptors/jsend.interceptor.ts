import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JSendStatus, JSendSuccess } from '../types/jsend.types';

@Injectable()
export class JSendInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: JSendSuccess<T>) => {
        return {
          status: data.status ?? JSendStatus.SUCCESS,
          data: data.data,
          message: data.message,
          meta: {
            timestamp: new Date().toISOString(),
            ...data.meta,
          },
        };
      }),
    );
  }
}
