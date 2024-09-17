import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { API_VERSION } from './app/common/constants';
import logger from './app/common/logger';
import { CustomValidationPipe } from './app/common/pipes/custom-validation.pipe';
import { environment } from './environments';
import { json } from 'express';

process.on('uncaughtException', (error) => {
  logger.error(error);
});

function rawBodyBuffer(req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.enableCors({
    origin: environment.allowedOrigins,
  });
  app.useGlobalPipes(new CustomValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Suitable Riders Backend API')
    .setDescription('The Suitable Riders Backend APIs')
    .setVersion('0.0')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/docs', app, document);
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: API_VERSION,
  });
  app.use(json({ verify: rawBodyBuffer }));
  await app.listen(process.env.HOST_PORT);
  if (process.env.NODE_ENV === 'test') {
    setTimeout(() => {
      app.close();
    }, 5000);
  }
}
bootstrap();
