import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { getLoggerConfig } from 'src/config/logger/logger.config';
import { AppLoggerService } from './app-logger.service';

@Global()
@Module({
  imports: [LoggerModule.forRoot(getLoggerConfig())],
  providers: [AppLoggerService],
  exports: [AppLoggerService, LoggerModule],
})
export class LoggingModule {}
