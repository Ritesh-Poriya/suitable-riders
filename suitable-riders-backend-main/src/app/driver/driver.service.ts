import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminSettingServices } from '../admin-settings/admin-settings.service';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { EventTypes } from '../common/@types/eventType';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { DriverProfileService } from '../driver-profile/driver-profile.service';
import { JobService } from '../job/job.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { MerchantProfileService } from '../merchant-profile/merchant-profile.service';
import { SaveUserLocationServices } from '../save-user-location/save-user-location.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DriverService {
  constructor(
    private adminSettingService: AdminSettingServices,
    private saveUserLocationServices: SaveUserLocationServices,
    private merchantProfileService: MerchantProfileService,
    private logger: Logger,
    private jobService: JobService,
    private usersService: UsersService,
    private eventEmitter: EventEmitter2,
    private driverProfileService: DriverProfileService,
  ) {}

  async getNearByDriversCount(user: UserPayload) {
    this.logger.debug(
      `DriverService.getNearByDriversCount() is called with user: ${JSON.stringify(
        user,
      )}`,
    );
    const merchantProfile =
      await this.merchantProfileService.getMyMerchantProfile(user.userID);
    this.logger.debug(
      `DriverService.getNearByDriversCount() merchantProfile: ${JSON.stringify(
        merchantProfile,
      )}`,
    );
    const adminSetting = await this.adminSettingService.getAdminSettings();
    this.logger.debug(
      `DriverService.getNearByDriversCount() adminSetting: ${JSON.stringify(
        adminSetting,
      )}`,
    );
    const nearByDrivers =
      await this.saveUserLocationServices.getDriversListNearToJobPickupLocation(
        merchantProfile.businessInfo.address.location.coordinates[1],
        merchantProfile.businessInfo.address.location.coordinates[0],
        adminSetting.findNearbyDriversWithinMiles * 1.60934 * 1000,
        [],
      );
    this.logger.debug(
      `DriverService.getNearByDriversCount() nearByDrivers: ${JSON.stringify(
        nearByDrivers,
      )}`,
    );
    const unavailableDrivers = await this.jobService.getUnavailableDrivers(
      nearByDrivers.map((d) => d._id),
    );
    const driversCount = nearByDrivers.length - unavailableDrivers.length;
    this.logger.debug(
      `DriverService.getNearByDriversCount() driversCount: ${driversCount}`,
    );
    return {
      driversCount,
    };
  }

  // Delete driver by userID
  public async deleteDriverByUserID(userID: string) {
    this.logger.debug(
      `DriverService.deleteDriverByUserID() is called with userID: ${userID}`,
    );
    const driver = await this.driverProfileService.getDriverProfileByUserID(
      userID,
    );
    if (!driver) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.DRIVER_PROFILE_NOT_FOUND,
      );
    }
    const activeJobs = await this.jobService.getActiveJobsForDriverByUserId(
      userID,
    );
    if (activeJobs.length > 0) {
      throw new CustomHTTPException(
        { key: 'errors.CAN_NOT_DELETE_DRIVER_WITH_ACTIVE_JOBS' },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.CAN_NOT_DELETE_DRIVER_WITH_ACTIVE_JOBS,
      );
    }
    await this.driverProfileService.deleteDriverProfile(userID);
    await this.usersService.deleteUserByID(userID);
    this.eventEmitter.emit(EventTypes.DriverDeleted, {
      userID: userID,
    });
    return {
      isDelete: true,
    };
  }
}
