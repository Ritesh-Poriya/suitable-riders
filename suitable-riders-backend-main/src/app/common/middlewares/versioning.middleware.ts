import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { AdminSettingServices } from 'src/app/admin-settings/admin-settings.service';
import { AppType, VersionOsType } from 'src/app/common/@types/version-type';
import semver from 'semver';
import { CustomHTTPException } from '../errors/custom.exception';
import { CustomErrorCodes } from '../@types/custom-error-codes';

@Injectable()
export class RequestCheck implements NestMiddleware {
  constructor(
    private logger: Logger,
    private adminSettingService: AdminSettingServices,
  ) {}

  public async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('RequestCheck');
    const os: VersionOsType = req.headers['os'];
    const clientAppVersion: any = req.headers['client-app-version'];
    const appType: AppType = req.headers['app-type'];
    const adminSetting = await this.adminSettingService.getAdminSettings();
    if (os === VersionOsType.ANDROID && appType === AppType.MERCHANT) {
      if (!clientAppVersion) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_APP_VERSION',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_APP_VERSION,
        );
      }
      if (semver.lt(clientAppVersion, adminSetting.androidHardUpdateMerchant)) {
        throw new CustomHTTPException(
          {
            key: 'errors.UPDATE_REQUIRED',
          },
          298,
          CustomErrorCodes.UPDATE_REQUIRED,
        );
      }
    }
    if (os === VersionOsType.ANDROID && appType === AppType.RIDER) {
      if (!clientAppVersion) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_APP_VERSION',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_APP_VERSION,
        );
      }
      if (semver.lt(clientAppVersion, adminSetting.androidHardUpdateRider)) {
        throw new CustomHTTPException(
          {
            key: 'errors.UPDATE_REQUIRED',
          },
          298,
          CustomErrorCodes.UPDATE_REQUIRED,
        );
      }
    }
    if (os === VersionOsType.IOS && appType === AppType.RIDER) {
      if (!clientAppVersion) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_APP_VERSION',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_APP_VERSION,
        );
      }
      if (semver.lt(clientAppVersion, adminSetting.iOSHardUpdate)) {
        throw new CustomHTTPException(
          {
            key: 'errors.UPDATE_REQUIRED',
          },
          298,
          CustomErrorCodes.UPDATE_REQUIRED,
        );
      }
    }
    next();
  }
}
