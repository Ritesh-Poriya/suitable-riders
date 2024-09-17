import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { EventTypes } from '../common/@types/eventType';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { JobService } from '../job/job.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { MediaService } from '../media/media.service';
import { UserRole } from '../users/@types/user-role-type';
import { UsersService } from '../users/users.service';
import { VehicleService } from '../vehicle/vehicle.service';
import {
  DriverAvailabilityStatus,
  VerificationStatus,
} from './@types/driver-profile-status-types';
import {
  CreateDriverProfileReqDTO,
  CreateDriverProfileResDTO,
} from './dto/create-driver-profile.dto';
import { SearchDriverProfileReqDTO } from './dto/search-driver-profile.dto';
import { UpdateDriverAvailabilityStatusReqDTO } from './dto/update-driver-availability.dto';
import { UpdateDriverProfileStatusReqDTO } from './dto/update-driver-profile-status.dto';
import { UpdateDriverProfileReqDTO } from './dto/update-driver-profile.dto';
import {
  DriverProfile,
  DriverProfileDocument,
} from './entity/driver-profile.entity';
import { UpdateDriverProfileVerificationStatusReqDTO } from './dto/update-driver-profile-verification-status.dto';
import { DriverProfileEventType } from './@types/driver-profile-event-type';
import { EmailService } from '../mailer/email.service';

@Injectable()
export class DriverProfileService {
  constructor(
    private mediaService: MediaService,
    private usersService: UsersService,
    @Inject(forwardRef(() => JobService))
    private jobService: JobService,
    private eventEmitter: EventEmitter2,
    @InjectModel(DriverProfile.name)
    private driverModel: Model<DriverProfileDocument>,
    private logger: Logger,
    private vehicleService: VehicleService,
    private emailService: EmailService,
  ) {}

  // Create driver profile
  public async createDriverProfile(
    dto: CreateDriverProfileReqDTO,
    user: UserPayload,
  ): Promise<CreateDriverProfileResDTO> {
    try {
      this.logger.debug(
        `DriverProfileService.createDriverProfile() with args: ${JSON.stringify(
          dto,
        )} and user: ${JSON.stringify(user)}`,
      );
      const foundDriver = await this.driverModel.findOne({
        ownerID: user.userID,
      });
      if (foundDriver) {
        throw new CustomHTTPException(
          { key: 'errors.DRIVER_ALREADY_EXISTS' },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.DRIVER_ALREADY_EXISTS,
        );
      }
      const newProfileImage = await this.mediaService.moveFile(
        dto.profileImage,
        user.userID,
      );
      const newLicenseDocument = await this.mediaService.moveFile(
        dto.licenseDocument,
        user.userID,
      );
      const newAddressDocument = await this.mediaService.moveFile(
        dto.addressDocument,
        user.userID,
      );
      const newWorkPermitDocument = await this.mediaService.moveFile(
        dto.workPermitDocument,
        user.userID,
      );
      const driver = await this.driverModel.create({
        ...dto,
        ownerID: user.userID,
        profileImage: newProfileImage,
        licenseDocument: newLicenseDocument,
        addressDocument: newAddressDocument,
        workPermitDocument: newWorkPermitDocument,
        // temp fix to run the profile signup.
        subscription: {
          id: '',
          startTime: new Date(1970),
          endTime: new Date(1970),
          status: 'trialing',
        },
      });
      await this.usersService.updateProfileImage(
        user.userID,
        driver.profileImage,
      );
      return driver;
    } catch (error) {
      throw error;
    }
  }

  // Get driver profile
  public async getDriverProfile(id: string, user: UserPayload) {
    this.logger.debug(
      `DriverProfileService.getDriverProfile() with args: ${id} and user: ${JSON.stringify(
        user,
      )}`,
    );
    const isAuthorized = await this.checkAuthorization(user);
    if (!isAuthorized) {
      throw new CustomHTTPException(
        { key: 'errors.FORBIDDEN' },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    const driverProfile = await this.driverModel
      .findOne({ ownerID: new Types.ObjectId(id) })
      .populate('ownerID');
    const vehicleCount = await this.vehicleService.getVehicleCountByUserId(id);
    const driverEarnings = await this.jobService.getEarnings(id);
    return {
      driverProfile,
      driverEarnings,
      vehicleCount,
    };
  }

  public async checkAuthorization(user: UserPayload) {
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    const driver = await this.driverModel.findOne({
      ownerID: new Types.ObjectId(user.userID),
    });
    if (!driver) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.DRIVER_NOT_FOUND,
      );
    }
    return true;
  }

  // Update driver profile
  public async updateDriverProfile(
    dto: UpdateDriverProfileReqDTO,
    user: UserPayload,
    id: string,
  ) {
    this.logger.debug(
      `DriverProfileService.updateDriverProfile() with args:  dto: ${JSON.stringify(
        dto,
      )} and id: ${id} and user: ${JSON.stringify(user)}`,
    );
    const isAUthorized = await this.checkAuthorization(user);
    if (!isAUthorized) {
      throw new CustomHTTPException(
        { key: 'errors.FORBIDDEN' },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    const isExist = await this.getDriverProfileById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
      );
    }
    return await this.update(dto, id);
  }

  private async update(driver: Partial<DriverProfile>, id: string) {
    this.logger.debug(
      `DriverProfileService.update() with args: driver: ${JSON.stringify(
        driver,
      )} and id: ${id}`,
    );
    const prevObj = await this.driverModel.findById(id);

    if (
      driver.profileImage &&
      prevObj.profileImage &&
      prevObj.profileImage !== driver.profileImage
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.profileImage);
      } catch (error) {
        this.logger.error(error);
      }

      driver.profileImage = await this.mediaService.moveFile(
        driver.profileImage,
        String(prevObj.ownerID),
      );
    }
    if (
      driver.licenseDocument &&
      prevObj.licenseDocument &&
      prevObj.licenseDocument !== driver.licenseDocument
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.licenseDocument);
      } catch (error) {
        this.logger.error(error);
      }
      driver.licenseDocument = await this.mediaService.moveFile(
        driver.licenseDocument,
        String(prevObj.ownerID),
      );
    }
    if (
      driver.addressDocument &&
      prevObj.addressDocument &&
      prevObj.addressDocument !== driver.addressDocument
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.addressDocument);
      } catch (error) {
        this.logger.error(error);
      }
      driver.addressDocument = await this.mediaService.moveFile(
        driver.addressDocument,
        String(prevObj.ownerID),
      );
    }
    if (
      driver.workPermitDocument &&
      prevObj.workPermitDocument &&
      prevObj.workPermitDocument !== driver.workPermitDocument
    ) {
      try {
        await this.mediaService.deleteFile(prevObj.workPermitDocument);
      } catch (error) {
        this.logger.error(error);
      }
      driver.workPermitDocument = await this.mediaService.moveFile(
        driver.workPermitDocument,
        String(prevObj.ownerID),
      );
    }
    if (prevObj.verificationStatus !== VerificationStatus.APPROVED) {
      Object.keys(prevObj.docsVerificationStatus).forEach((key) => {
        if (key == 'vehicle') {
          return;
        }
        if (
          prevObj.docsVerificationStatus[key].status ==
          VerificationStatus.REJECTED
        ) {
          prevObj.docsVerificationStatus[key].status =
            VerificationStatus.SUBMITTED;
        }
      });
      driver.verificationStatus = VerificationStatus.SUBMITTED;
      driver.docsVerificationStatus = prevObj.docsVerificationStatus;
    }
    const updatedDriver = this.driverModel.findByIdAndUpdate(
      id,
      { $set: driver },
      { new: true },
    );
    await this.usersService.updateProfileImage(
      String(prevObj.ownerID),
      driver.profileImage,
    );
    return updatedDriver;
  }

  // Update driver profile status
  public async updateDriverProfileStatus(
    dto: UpdateDriverProfileStatusReqDTO,
    id: string,
  ) {
    this.logger.debug(
      `DriverProfileService.updateDriverProfileStatus() with args:  dto: ${JSON.stringify(
        dto,
      )} and id: ${id}`,
    );
    const isExist = await this.getDriverProfileById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
      );
    }
    // TODO: Fix Driver status
    const driverProfile = await this.driverModel.findByIdAndUpdate(
      id,
      { $set: { status: dto.status } },
      { new: true },
    );
    return driverProfile;
  }

  // Update driver profile verification status
  public async updateDriverProfileVerificationStatus(
    dto: UpdateDriverProfileVerificationStatusReqDTO,
    id: string,
  ) {
    this.logger.debug(
      `DriverProfileService.updateDriverProfileVerificationStatus() with args:  dto: ${JSON.stringify(
        dto,
      )} and id: ${id}`,
    );
    const isExist = await this.getDriverProfileById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
      );
    }
    // TODO: Fix Driver status
    let driverProfile = await this.driverModel
      .findByIdAndUpdate(
        id,
        { $set: { docsVerificationStatus: dto.docsVerificationStatus } },
        { new: true },
      )
      .populate('ownerID');

    let profileStatus;
    if (
      Object.keys(dto.docsVerificationStatus).some(
        (e) =>
          dto.docsVerificationStatus[e].status === VerificationStatus.REJECTED,
      )
    ) {
      profileStatus = VerificationStatus.REJECTED;
    } else if (
      Object.keys(dto.docsVerificationStatus).every(
        (e) =>
          dto.docsVerificationStatus[e].status === VerificationStatus.APPROVED,
      )
    ) {
      profileStatus = VerificationStatus.APPROVED;
    }

    if (profileStatus && driverProfile.verificationStatus !== profileStatus) {
      driverProfile = await this.driverModel
        .findByIdAndUpdate(
          id,
          { $set: { verificationStatus: profileStatus } },
          { new: true },
        )
        .populate('ownerID');
    }

    this.eventEmitter.emit(
      DriverProfileEventType.DRIVER_DOCS_VERIFICATION_STATUS_UPDATE,
      driverProfile.ownerID,
      driverProfile.verificationStatus,
    );

    return driverProfile;
  }
  // Update driver profile verification status
  public async getPendingProfilesCount() {
    this.logger.debug(`DriverProfileService.getPendingProfilesCount()`);

    const pendingDriverCount = await this.driverModel.count({
      verificationStatus: VerificationStatus.SUBMITTED,
      isDeleted: false,
    });

    return { pendingDriverCount };
  }

  public async updateDriverAvailabilityStatus(
    dto: UpdateDriverAvailabilityStatusReqDTO,
    user: UserPayload,
  ) {
    this.logger.debug(
      `DriverProfileService.updateDriverAvailabilityStatus() with args: dto: ${JSON.stringify(
        dto,
      )} and user: ${JSON.stringify(user)}`,
    );
    const driverProfile = await this.driverModel.findOneAndUpdate(
      { ownerID: user.userID },
      { $set: { availabilityStatus: dto.availabilityStatus } },
      { new: true },
    );
    return driverProfile;
  }

  // Delete driver profile
  public async deleteDriverProfileByUser(user: UserPayload) {
    this.logger.debug(
      `DriverProfileService.deleteDriverProfileByUser() user: ${JSON.stringify(
        user,
      )}`,
    );
    const driver = await this.driverModel.findOne({
      ownerID: user.userID,
      isDeleted: false,
    });
    if (!driver) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
      );
    }
    const activeJobs = await this.jobService.getActiveJobsForDriverByUserId(
      user.userID,
    );
    if (activeJobs.length > 0) {
      throw new CustomHTTPException(
        { key: 'errors.CAN_NOT_DELETE_DRIVER_WITH_ACTIVE_JOBS' },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.CAN_NOT_DELETE_DRIVER_WITH_ACTIVE_JOBS,
      );
    }
    await this.driverModel.updateOne(
      { ownerID: new Types.ObjectId(user.userID) },
      { $set: { isDeleted: true } },
    );
    await this.usersService.deleteUser(user.userID, user);
    this.eventEmitter.emit(EventTypes.DriverDeleted, {
      userID: user.userID,
    });
    return {
      isDelete: true,
    };
  }

  // Get driver profiles
  public async getDriverProfiles() {
    const driverProfiles = await this.driverModel.find({ isDeleted: false });
    if (!driverProfiles) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILES_NOT_FOUND,
      );
    }
    const totalCount = await this.driverModel.count({ isDeleted: false });
    return {
      data: driverProfiles,
      totalCount,
    };
  }

  public async getDriverProfileById(id: string) {
    const isExist = await this.driverModel.findById(id);
    return isExist;
  }

  public async getMyDriverProfile(userID: string) {
    this.logger.debug(
      `DriverProfileService.getMyDriverProfile() userID: ${userID}`,
    );
    return this.driverModel.findOne({
      ownerID: new Types.ObjectId(userID),
    });
  }

  /**
   * Search merchant profile
   */
  async searchDriverProfile(
    dto: SearchDriverProfileReqDTO,
    customSearchQuery: any = null,
  ) {
    this.logger.debug(
      `DriverProfileService.searchDriverProfile() dto: ${JSON.stringify(dto)}`,
    );
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'driver.username': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              licenseNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'driver.email': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'driver.phone': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              driverNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    const filterQuery = {
      ...dto.fields,
      isDeleted: false,
    };
    const driverProfile = await this.driverModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerID',
          foreignField: '_id',
          as: 'driver',
        },
      },
      {
        $unwind: {
          path: '$driver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          as: 'vehicles',
          let: {
            ownerID: '$ownerID',
          },
          pipeline: [
            {
              $match: {
                isDeleted: false,
                $expr: {
                  $eq: ['$ownerID', '$$ownerID'],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          vehicles: { $size: '$vehicles' },
        },
      },
      {
        $match: filterQuery,
      },
      {
        $match: search,
      },
      { $sort: dto.options?.sort || { createdAt: -1 } },
      {
        $skip: dto.options?.skip || 0,
      },
      {
        $limit: dto.options?.limit || 100,
      },
    ]);
    const filterCount = (
      await this.driverModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'ownerID',
            foreignField: '_id',
            as: 'driver',
          },
        },
        {
          $unwind: {
            path: '$driver',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'ownerID',
            foreignField: 'ownerID',
            as: 'vehicles',
          },
        },
        {
          $addFields: {
            vehicles: { $size: '$vehicles' },
          },
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
      ])
    ).length;
    const count = await this.driverModel.count({
      isDeleted: false,
    });

    return {
      driverProfile: driverProfile,
      totalCount: count,
      filterCount: filterCount,
    };
  }

  public async deleteDriverProfile(ownerID: string) {
    this.logger.debug(
      `DriverProfileService.deleteDriverProfile() ownerID: ${ownerID}`,
    );
    await this.driverModel.updateOne(
      { ownerID: new Types.ObjectId(ownerID) },
      { $set: { isDeleted: true } },
    );
  }

  public async getDriverProfileByUserID(userID: string) {
    this.logger.debug(
      `DriverProfileService.getDriverProfileByUserID() userID: ${userID}`,
    );
    return this.driverModel.findOne({
      ownerID: new Types.ObjectId(userID),
      isDeleted: false,
    });
  }

  /**
   * Function to get driver count
   */
  public async getDriverProfileCount() {
    const driverCount = await this.driverModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'devices',
          localField: 'ownerID',
          foreignField: 'userID',
          as: 'device',
        },
      },
      {
        $project: {
          device: {
            $first: '$device',
          },
        },
      },
      {
        $addFields: {
          isAndroid: {
            $regexMatch: {
              input: '$device.deviceOS',
              regex: /android/i,
            },
          },
          isIOS: {
            $regexMatch: {
              input: '$device.deviceOS',
              regex: /ios/i,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          android: {
            $sum: {
              $cond: ['$isAndroid', 1, 0],
            },
          },
          ios: {
            $sum: {
              $cond: ['$isIOS', 1, 0],
            },
          },
        },
      },
    ]);
    return {
      android: driverCount[0].android,
      ios: driverCount[0].ios,
      total: driverCount[0].android + driverCount[0].ios,
    };
  }

  /**
   * Function to get driver profile to unavailable
   */

  public async getDriverProfileToUnavailable() {
    return await this.driverModel.find({
      isDeleted: false,
    });
  }

  /**
   * Function to set driver profile unavailable
   */
  public async setDriverProfileUnavailable(ids: string[]) {
    this.logger.debug(
      `DriverProfileService.setDriverProfileUnavailable() ids: ${ids}`,
    );
    return await this.driverModel.updateMany(
      { _id: { $in: ids } },
      { $set: { availabilityStatus: DriverAvailabilityStatus.UNAVAILABLE } },
    );
  }
}
