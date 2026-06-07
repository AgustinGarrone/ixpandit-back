import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getThrottlerConfig } from './config/throttler/throttler.config';
import { AuthModule } from './features/auth/auth.module';
import { PokemonModule } from './features/pokemon/pokemon.module';

@Module({
  imports: [
    ThrottlerModule.forRoot(getThrottlerConfig()),
    AuthModule,
    PokemonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
