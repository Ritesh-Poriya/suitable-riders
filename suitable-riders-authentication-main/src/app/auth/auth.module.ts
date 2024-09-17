import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersCoreModule } from '../users/users-core.module';
import { CommonModule } from '../common/common.module';
import { JwtModule } from '../jwt/jwt.module';
import { ConfigService } from '@nestjs/config';
import { BlockingModule } from '../blocking/blocking.module';
import { FirebaseModule } from '../firebase/firebase.module';
import * as path from 'path';
import { AuthGuard } from './guards/auth.guard';
import { OTPModule } from '../otp/otp.module';
import { RolesGuard } from './guards/roles.guard';
import { HttpModule } from '@nestjs/axios';
import { AuthEventListener } from './listeners/auth-event-listener';

const secretFolderPath = `../../environments/${process.env.NODE_ENV}/secrets`;

@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: path.resolve(
        __dirname,
        `${secretFolderPath}/firebase-service-account-private-key-file.json`,
      ),
    }),
    UsersCoreModule,
    CommonModule,
    OTPModule,
    JwtModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('jwtConfig'),
    }),
    BlockingModule,
    HttpModule,
  ],
  providers: [AuthService, AuthGuard, RolesGuard, AuthEventListener],
  controllers: [AuthController],
  exports: [AuthGuard, RolesGuard],
})
export class AuthModule {}
