import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { JSendExceptionFilter } from './common/interceptors/jsend.exception.filter';
import { JSendInterceptor } from './common/interceptors/jsend.interceptor';
import { LoggingModule } from './common/logging/logging.module';
import { getThrottlerConfig } from './config/throttler/throttler.config';
import { AuthModule } from './features/auth/auth.module';
import { FavoritesModule } from './features/favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { PokemonModule } from './features/pokemon/pokemon.module';

@Module({
  imports: [
    LoggingModule,
    ThrottlerModule.forRoot(getThrottlerConfig()),
    HealthModule,
    AuthModule,
    FavoritesModule,
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: JSendInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: JSendExceptionFilter,
    },
  ],
})
export class AppModule {}
