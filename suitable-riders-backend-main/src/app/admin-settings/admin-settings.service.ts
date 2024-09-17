import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AppType,
  UpdateStatusType,
  VersionOsType,
} from '../common/@types/version-type';
import { UpdateAdminSettingsDTO } from './dto/update-admin-settings.dto';
import {
  AdminSetting,
  AdminSettingsDocument,
} from './entity/admin-settings.entity';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import semver from 'semver';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminSettingsEventType } from './@types/admin-settings-event-type';

/**
 * Admin Settings services
 */
export class AdminSettingServices {
  constructor(
    @InjectModel(AdminSetting.name)
    private adminSettings: Model<AdminSettingsDocument>,
    private eventEmitter: EventEmitter2,
  ) {}
  /**
   * Function to get admin settings
   */
  public async getAdminSettings() {
    return this.adminSettings.findOne();
  }

  /**
   * Function to get splash admin settings
   */
  public async getSplashAdminSettings(req) {
    const adminSetting = await this.adminSettings.findOne(
      {},
      {
        _id: 0,
        updatedAt: 0,
      },
    );
    const os: VersionOsType = req.headers['os'];
    const clientAppVersion: any = req.headers['client-app-version'];
    const appType: AppType = req.headers['app-type'];
    let updateStatus = null;
    if (os && clientAppVersion && adminSetting) {
      updateStatus = this.getAppUpdateStatus(
        os,
        clientAppVersion,
        adminSetting,
        appType,
      );
    }
    return {
      adminSetting,
      updateStatus,
    };
  }

  /**
   * Function to update admin settings
   */
  public async updateAdminSettings(dto: UpdateAdminSettingsDTO) {
    console.log(dto);
    const adminSetting = await this.adminSettings.findOne();
    if (adminSetting.isDayLightSavingEnabled !== dto.isDayLightSavingEnabled) {
      this.eventEmitter.emit(
        AdminSettingsEventType.IS_DAY_LIGHT_SAVING_ENABLED_UPDATE,
      );
    }
    return this.adminSettings.findOneAndUpdate(
      {},
      { $set: dto },
      { new: true },
    );
  }

  public getAppUpdateStatus(
    os: string,
    clientAppVersion: string,
    adminSetting: any,
    appType: AppType,
  ): null | UpdateStatusType {
    if (semver.valid(clientAppVersion)) {
      if (os === VersionOsType.ANDROID && appType === AppType.MERCHANT) {
        if (
          semver.lt(clientAppVersion, adminSetting.androidSoftUpdateMerchant)
        ) {
          return UpdateStatusType.SOFT_UPDATE;
        }
      } else if (os === VersionOsType.ANDROID && appType === AppType.RIDER) {
        if (semver.lt(clientAppVersion, adminSetting.androidSoftUpdateRider)) {
          return UpdateStatusType.SOFT_UPDATE;
        }
      } else if (os === VersionOsType.IOS && appType === AppType.RIDER) {
        if (semver.lt(clientAppVersion, adminSetting.iOSSoftUpdate)) {
          return UpdateStatusType.SOFT_UPDATE;
        }
      } else {
        return null;
      }
    } else {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_APP_VERSION',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_APP_VERSION,
      );
    }
  }
}
