import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { IJwtConfiguration } from '../common/@types/configuration';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';
import {
  UserPayload,
  UserRefreshTokenPayload,
} from './@types/user-payload.interface';
import { JWT_CONFIGURATION } from './jwt.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(JWT_CONFIGURATION)
    private configService: ConfigService<IJwtConfiguration>,
  ) {}

  getAccessTokenExpiryTime(inSeconds?: boolean): number {
    if (inSeconds) {
      return this.configService.get('accessTokenExpireIn') / 1000;
    }
    return this.configService.get('accessTokenExpireIn');
  }

  getRefreshTokenExpiryTime(inSeconds?: boolean): number {
    if (inSeconds) {
      return this.configService.get('refreshTokenExpireIn') / 1000;
    }
    return this.configService.get('refreshTokenExpireIn');
  }

  async validateAccessToken(token: string): Promise<any> {
    const payload = (await jwt.verify(
      token,
      this.configService.get('publicKey'),
    )) as UserPayload;
    return payload;
  }

  async validateRefreshToken(token: string): Promise<UserPayload> {
    const { isRefreshToken, ...payload } = (await jwt.verify(
      token,
      this.configService.get('publicKey'),
    )) as UserRefreshTokenPayload;
    if (isRefreshToken) {
      return payload;
    }
    throw new CustomHTTPException(
      {
        key: 'errors.INVALID_REFRESH_TOKEN',
      },
      HttpStatus.FORBIDDEN,
      CustomErrorCodes.INVALID_REFRESH_TOKEN,
    );
  }
}
