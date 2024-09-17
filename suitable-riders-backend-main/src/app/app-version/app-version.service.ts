import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { CreateAppVersionReqDTO } from './dto/create-app-version.dto';
import { AppVersion, AppVersionDocument } from './entity/app-version.entity';

@Injectable()
export class AppVersionService {
  constructor(
    @InjectModel(AppVersion.name)
    private appVersionModel: Model<AppVersionDocument>,
    private logger: Logger,
  ) {}

  public async createAppVersion(dto: CreateAppVersionReqDTO) {
    this.logger.debug(
      `AppVersionService.createAppVersion(): dto: ${JSON.stringify(dto)}`,
    );
    const isExist = await this.appVersionModel.findOne({
      appType: dto.appType,
      os: dto.os,
      versionNo: dto.versionNo,
      isDeleted: false,
    });
    if (isExist) {
      throw new CustomHTTPException(
        {
          key: 'errors.APP_VERSION_ALREADY_EXIST',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.APP_VERSION_ALREADY_EXIST,
      );
    }
    return this.appVersionModel.create(dto);
  }

  public async getAppVersions() {
    const appVersions = await this.appVersionModel
      .find({ isDeleted: false })
      .sort({
        createdAt: -1,
      });
    const totalCount = appVersions.length;
    return {
      appVersions: appVersions,
      totalCount: totalCount,
    };
  }

  public async deleteAppVersion(id: string) {
    this.logger.debug(`AppVersionService.deleteAppVersion(): id: ${id}`);
    const appVersion = await this.appVersionModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });
    if (!appVersion) {
      throw new CustomHTTPException(
        {
          key: 'errors.APP_VERSION_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.APP_VERSION_NOT_FOUND,
      );
    }
    await this.appVersionModel.updateOne(
      { _id: new Types.ObjectId(id) },
      {
        $set: { isDeleted: true },
      },
      { new: true },
    );
    return true;
  }
}
