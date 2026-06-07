import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';
import { getCorsConfig } from './config/cors/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors(getCorsConfig());

  const config = new DocumentBuilder()
    .setTitle('Pokemon IXP API')
    .setDescription(
      'Backend API for the Pokemon IXP project. Responses follow the JSend format with status, data, message and meta fields.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.APP_PORT ?? 8100;
  await app.listen(port);

  app.get(Logger).log(`Application running on port ${port}`);
}
void bootstrap();
