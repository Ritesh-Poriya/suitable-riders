import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminSettingModule } from '../admin-settings/admin-settings.module';
import { JwtModule } from '../jwt/jwt.module';
import { UsersCoreModule } from '../users/users-core.module';
import { FilePathService } from './file-path.service';
import { FilesService } from './files.service';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ImageProcessingService } from './image-processing.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { RequestLoggingMiddleware } from './middlewares/request-logging.middleware';
import { RequestCheck } from './middlewares/versioning.middleware';
import { CustomValidationPipe } from './pipes/custom-validation.pipe';
import { UtilService } from './util.service';

@Module({
  imports: [
    JwtModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('jwtConfig'),
    }),
    UsersCoreModule,
    AdminSettingModule,
  ],
  providers: [
    UtilService,
    Logger,
    LoggingInterceptor,
    FilesService,
    RequestLoggingMiddleware,
    AllExceptionFilter,
    CustomValidationPipe,
    AuthGuard,
    RolesGuard,
    ImageProcessingService,
    FilePathService,
    RequestCheck,
  ],
  exports: [
    UtilService,
    Logger,
    LoggingInterceptor,
    FilesService,
    RequestLoggingMiddleware,
    AllExceptionFilter,
    CustomValidationPipe,
    AuthGuard,
    RolesGuard,
    ImageProcessingService,
    FilePathService,
    RequestCheck,
  ],
})
export class CommonModule {}
