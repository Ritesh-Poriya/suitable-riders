import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersCoreModule } from './users/users-core.module';
import { CommonModule } from './common/common.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IEnvironmentVariables } from './common/@types/IEnvironmentVariables';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { BullModule } from '@nestjs/bull';
import {
  redisDbConfiguration,
  mongoConfiguration,
  redisConfiguration,
  mailerConfiguration,
  jwtConfiguration,
  settingsConfiguration,
} from './common/configuration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from './mailer/mailer.module';
import { LogsModule } from './logs/logs.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockingModule } from './blocking/blocking.module';
import { RequestLoggingMiddleware } from './common/middlewares/request-logging.middleware';
import { HeaderResolver, I18nJsonParser, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { AuthGuard } from './auth/guards/auth.guard';
import { UsersModule } from './users/users.module';
import { HEADER_LANG_KEY } from './common/constants';

const i18nFilesPath = '../assets/i18n/';
const templateFolder = path.resolve(__dirname, '../assets/email-templates');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [
        mongoConfiguration,
        redisConfiguration,
        redisDbConfiguration,
        mailerConfiguration,
        jwtConfiguration,
        settingsConfiguration,
      ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<IEnvironmentVariables>,
      ) => {
        return {
          uri: configService.get('MONGO_URL'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, i18nFilesPath),
        watch: process.env.NODE_ENV !== 'prod',
      },
      resolvers: [new HeaderResolver([HEADER_LANG_KEY])],
    }),
    LogsModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        db: +process.env.REDIS_DB,
      },
    }),
    RedisModule.forRoot({
      db: parseInt(process.env.REDIS_DB),
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    }),
    MailerModule.forRoot({
      transportConfig: {
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      templateFolderPath: templateFolder,
    }),
    EventEmitterModule.forRoot(),
    TerminusModule,
    UsersCoreModule,
    CommonModule,
    AuthModule,
    ScheduleModule.forRoot(),
    BlockingModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
