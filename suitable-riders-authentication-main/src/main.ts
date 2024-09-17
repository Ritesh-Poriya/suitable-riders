import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import logger from './app/common/logger';
import { CustomValidationPipe } from './app/common/pipes/custom-validation.pipe';
import { environment } from './environments';

process.on('uncaughtException', (error) => {
  logger.error(error);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.enableCors({
    origin: environment.allowedOrigins,
  });
  app.useGlobalPipes(new CustomValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Suitable Riders Auth API')
    .setDescription('The Suitable Riders Auth APIs')
    .setVersion('0.0')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/auth/docs', app, document);
  await app.listen(process.env.HOST_PORT);
  if (process.env.NODE_ENV === 'test') {
    setTimeout(() => {
      app.close();
    }, 5000);
  }
}
bootstrap();
