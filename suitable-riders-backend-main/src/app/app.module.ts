import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { HeaderResolver, I18nJsonParser, I18nModule } from 'nestjs-i18n';
import path from 'path';
import { IEnvironmentVariables } from './common/@types/IEnvironmentVariables';
import { CommonModule } from './common/common.module';
import {
  jwtConfiguration,
  mailerConfiguration,
  mongoConfiguration,
  redisConfiguration,
  redisDbConfiguration,
  settingsConfiguration,
  smsConfiguration,
} from './common/configuration';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { AuthGuard } from './common/guards/auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestLoggingMiddleware } from './common/middlewares/request-logging.middleware';
import { LogsModule } from './logs/logs.module';
import { MediaModule } from './media/media.module';
import { MerchantProfileModule } from './merchant-profile/merchant-profile.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JobModule } from './job/job.module';
import { DriverProfileModule } from './driver-profile/driver-profile.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { GoogleApiModule } from './distance-matrix/googlr-api.module';
import { NotificationModule } from './notification/notification.module';
import { PDFModule } from './pdf/pdf.module';
import { AdminSettingModule } from './admin-settings/admin-settings.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SaveUserLocationModule } from './save-user-location/save-user-location.module';
import { DeviceModule } from './device/device.module';
import { UsersCoreModule } from './users/users-core.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { MailerModule } from './mailer/mailer.module';
import { SupportModule } from './support/support.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DriverModule } from './driver/driver.module';
import { MerchantModule } from './merchant/merchant.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SubscriptionTransactionsModule } from './subscription-transactions/subscription-transactions.module';
import { SMSModule } from './sms/sms.module';
import { OTPModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { SmsTemplatesModule } from './sms-templates/sms-templates.module';
import { SubscribeNewsLetterModule } from './subscribe-news-letter/subscribe-news-letter.module';
import { RequestCheck } from './common/middlewares/versioning.middleware';
import { AppVersionModule } from './app-version/app-version.module';
import { WebHookModule } from './webhook/webhook.module';
import { StripeModule } from './stripe/stripe.module';
import { MerchantPayoutsModule } from './merchant-payouts/merchant-payouts.module';
import { GatewayModule } from './gateway/gateway.module';

const i18nFilesPath = '../assets/i18n';
const publicFolderPath = '../../public';
const pdfTemplatePath = path.join(__dirname, './../assets/pdf/templates');
const secretFolderPath = `../environments/${process.env.NODE_ENV}/secrets`;
const emailTemplateFolder = path.resolve(
  __dirname,
  '../assets/email-templates',
);

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
        smsConfiguration,
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
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, publicFolderPath),
      serveRoot: '/media/',
    }),
    FirebaseModule.forRoot({
      googleApplicationCredential: path.resolve(
        __dirname,
        `${secretFolderPath}/firebase-service-account-private-key-file.json`,
      ),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, i18nFilesPath),
        watch: process.env.NODE_ENV !== 'prod',
      },
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    CommonModule,
    RedisModule.forRoot({
      db: parseInt(process.env.REDIS_DB),
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      keyPrefix: process.env.REDIS_KEY_PREFIX,
    }),
    UsersCoreModule,
    LogsModule,
    TerminusModule,
    EventEmitterModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    PDFModule.register({
      templatePath: pdfTemplatePath,
    }),
    WebHookModule.register({
      url: process.env.WEB_HOOK_URL,
      auth_token: process.env.WEB_HOOK_AUTH_TOKEN,
    }),
    StripeModule.register({
      secret_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET,
    }),
    MailerModule.forRoot({
      transportConfig: {
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      templateFolderPath: emailTemplateFolder,
    }),
    SMSModule.forRoot({
      smsAPIKey: process.env.SMS_APT_KEY,
      smsSendingUrl: process.env.SMS_URL,
    }),
    OTPModule,
    NotificationModule,
    MediaModule,
    MerchantProfileModule,
    JobModule,
    DriverProfileModule,
    DriverModule,
    MerchantModule,
    VehicleModule,
    GoogleApiModule,
    NotificationModule,
    AdminSettingModule,
    SaveUserLocationModule,
    DeviceModule,
    SupportModule,
    ScheduleModule.forRoot(),
    DashboardModule,
    SubscriptionTransactionsModule,
    SmsTemplatesModule,
    SubscribeNewsLetterModule,
    AppVersionModule,
    MerchantPayoutsModule,
    GatewayModule
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*')
      .apply(RequestCheck)
      .forRoutes('*');
  }
}
