import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { JobService } from '../job/job.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { MediaService } from '../media/media.service';
import { VehicleTypes } from './@types/vehicle-types';
import { CreateVehicleReqDTO } from './dtos/create-vehicle.dto';
import { GetMyVehicleReqDTO } from './dtos/get-my-vehicles.dto';
import { SearchVehicleReqDTO } from './dtos/search-vehicle.dto';
import { UpdateVehicleStatusReqDTO } from './dtos/update-vehicle-status.dto';
import { UpdateVehicleReqDTO } from './dtos/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './entity/vehicle.entity';
import {
  DriverProfile,
  DriverProfileDocument,
} from '../driver-profile/entity/driver-profile.entity';
import { VerificationStatus } from '../driver-profile/@types/driver-profile-status-types';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DriverProfileEventType } from '../driver-profile/@types/driver-profile-event-type';

@Injectable()
export class VehicleService {
  constructor(
    private mediaService: MediaService,
    @Inject(forwardRef(() => JobService))
    private jobService: JobService,
    @InjectModel(Vehicle.name)
    private vehicleModel: Model<VehicleDocument>,
    @InjectModel(DriverProfile.name)
    private driverProfileModel: Model<DriverProfileDocument>,
    private eventEmitter: EventEmitter2,
    private logger: Logger,
  ) {}

  private async validateVehicle(dto: CreateVehicleReqDTO, userID: string) {
    this.logger.debug(
      `vehicleService.validateVehicle() dto: ${JSON.stringify(dto)}`,
    );
    if (
      dto.vehicleType !== VehicleTypes.CYCLE &&
      dto.vehicleType !== VehicleTypes.eBIKE
    ) {
      if (!dto.motDocument || !dto.vehicleBusinessInsuranceDocument)
        throw new CustomHTTPException(
          {
            key: 'errors.VALIDATION_FAILED',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.VALIDATION_FAILED,
        );
    }
    if (dto.vehicleRegistrationNumber) {
      const vehicleRegistrationNumber = dto.vehicleRegistrationNumber.replace(
        /\s/g,
        '',
      );
      const oldVehicle = await this.vehicleModel.findOne({
        ownerID: new Types.ObjectId(userID),
        vehicleRegistrationNumber: vehicleRegistrationNumber,
        isDeleted: false,
      });
      if (oldVehicle) {
        throw new CustomHTTPException(
          {
            key: 'errors.VEHICLE_ALREADY_EXISTS_WITH_SAME_REGISTRATION_NUMBER',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.VEHICLE_ALREADY_EXISTS_WITH_SAME_REGISTRATION_NUMBER,
        );
      }
    }
  }

  // Create vehicle
  public async createVehicle(
    dto: CreateVehicleReqDTO,
    user: UserPayload,
  ): Promise<CreateVehicleReqDTO> {
    try {
      await this.validateVehicle(dto, user.userID);
      let motDocument = null;
      if (dto.motDocument) {
        motDocument = await this.mediaService.moveFile(
          dto.motDocument,
          user.userID,
        );
      }
      let vehicleInsuranceDocument = null;
      if (dto.vehicleBusinessInsuranceDocument) {
        vehicleInsuranceDocument = await this.mediaService.moveFile(
          dto.vehicleBusinessInsuranceDocument,
          user.userID,
        );
      }
      let registrationNumber = '';
      if (dto.vehicleRegistrationNumber) {
        registrationNumber = dto.vehicleRegistrationNumber.replace(/\s/g, '');
      }
      const vehicle = await this.vehicleModel.create({
        ...dto,
        vehicleRegistrationNumber: registrationNumber,
        ownerID: user.userID,
        motDocument: motDocument,
        vehicleBusinessInsuranceDocument: vehicleInsuranceDocument,
      });

      if (
        (await this.vehicleModel.count({
          ownerID: user.userID,
          isDeleted: false,
        })) == 1
      ) {
        this.eventEmitter.emit(
          DriverProfileEventType.DRIVER_REGISTERED,
          user.userID,
        );
      }

      return vehicle;
    } catch (error) {
      throw error;
    }
  }

  // Get vehicle
  public async getVehicle(id: string) {
    await this.isExists(id);
    return this.vehicleModel.findById(id);
  }

  public async getMyVehicle(dto: GetMyVehicleReqDTO, userID: string) {
    this.logger.debug(
      `VehicleService.getMyVehicle() dto: ${JSON.stringify(
        dto,
      )} - userID ${userID}`,
    );
    dto.fields = {
      ...dto.fields,
      userID: new Types.ObjectId(userID),
    };
    const vehicles = await this.vehicleModel.find(
      {
        isDeleted: false,
        ...dto.fields,
      },
      null,
      dto.options,
    );

    const totalCount = await this.vehicleModel.count({
      isDeleted: false,
      ...dto.fields,
    });
    if (!vehicles) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOT_FOUND',
        },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.VEHICLE_NOT_FOUND,
      );
    } else {
      return {
        vehicles: vehicles,
        totalCount,
      };
    }
  }

  // Get all vehicle by filters
  public async searchVehicle(
    dto: SearchVehicleReqDTO,
    customSearchQuery: any = null,
  ) {
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              'driver.driverNumber': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              vehicleNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              vehicleType: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              vehicleRegistrationNumber: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              brandMakeModelYear: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    this.logger.debug(dto);
    const filterQuery = {
      isDeleted: false,
      ...dto.fields,
    };
    const vehicles = await this.vehicleModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerID',
          foreignField: '_id',
          as: 'driver',
        },
      },
      {
        $lookup: {
          from: 'driverprofiles',
          localField: 'ownerID',
          foreignField: 'ownerID',
          as: 'driverProfiles',
        },
      },
      {
        $unwind: {
          path: '$driver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$driverProfiles',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filterQuery,
      },
      {
        $match: search,
      },
      { $sort: dto.options.sort || { createdAt: -1 } },
      {
        $skip: dto.options.skip,
      },
      {
        $limit: dto.options.limit,
      },
      {
        $unset: [
          'driver._id',
          'driver.isDeleted',
          'driver.status',
          'driver.createdAt',
          'driver.updatedAt',
        ],
      },
      {
        $unset: [
          'driverProfiles._id',
          'driverProfiles.isDeleted',
          'driverProfiles.status',
          'driverProfiles.createdAt',
          'driverProfiles.updatedAt',
        ],
      },
    ]);

    const filterCount = (
      await this.vehicleModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'ownerID',
            foreignField: '_id',
            as: 'driver',
          },
        },
        {
          $lookup: {
            from: 'driverprofiles',
            localField: 'ownerID',
            foreignField: 'ownerID',
            as: 'driverProfiles',
          },
        },
        {
          $unwind: {
            path: '$driver',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$driverProfiles',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
        {
          $unset: [
            'driver._id',
            'driver.isDeleted',
            'driver.status',
            'driver.createdAt',
            'driver.updatedAt',
          ],
        },
        {
          $unset: [
            'driverProfiles._id',
            'driverProfiles.isDeleted',
            'driverProfiles.status',
            'driverProfiles.createdAt',
            'driverProfiles.updatedAt',
          ],
        },
      ])
    ).length;

    const totalCount = await this.vehicleModel.count({
      isDeleted: false,
    });
    return {
      vehicles: vehicles,
      totalCount: totalCount,
      filterCount: filterCount,
    };
  }

  // Update vehicle
  public async updateVehicle(
    dto: UpdateVehicleReqDTO,
    user: UserPayload,
    id: string,
  ) {
    this.logger.debug(
      `VehicleService.updateVehicle() dto: ${JSON.stringify(
        dto,
      )} user: ${JSON.stringify(user)} id: ${id}`,
    );
    const isAuthorized = await this.checkAuthorization(user, id);
    if (!isAuthorized) {
      throw new CustomHTTPException(
        { key: 'errors.FORBIDDEN' },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    await this.isExists(id);
    return await this.update(dto, id);
  }

  private async update(vehicle: Partial<Vehicle>, id: string) {
    const prevObj = await this.vehicleModel.findById(id);

    if (vehicle.motDocument && prevObj.motDocument !== vehicle.motDocument) {
      try {
        await this.mediaService.deleteFile(prevObj.motDocument);
      } catch (error) {
        this.logger.error(error);
      }
      vehicle.motDocument = await this.mediaService.moveFile(
        vehicle.motDocument,
        String(prevObj.ownerID),
      );
    }
    if (
      vehicle.vehicleBusinessInsuranceDocument &&
      prevObj.vehicleBusinessInsuranceDocument &&
      prevObj.vehicleBusinessInsuranceDocument !==
        vehicle.vehicleBusinessInsuranceDocument
    ) {
      try {
        await this.mediaService.deleteFile(
          prevObj.vehicleBusinessInsuranceDocument,
        );
      } catch (error) {
        this.logger.error(error);
      }
      vehicle.vehicleBusinessInsuranceDocument =
        await this.mediaService.moveFile(
          vehicle.vehicleBusinessInsuranceDocument,
          String(prevObj.ownerID),
        );
    }
    await this.driverProfileModel.updateOne(
      { ownerID: new Types.ObjectId(String(prevObj.ownerID)) },
      {
        $set: {
          verificationStatus: VerificationStatus.SUBMITTED,
          'docsVerificationStatus.vehicle.status': VerificationStatus.SUBMITTED,
        },
      },
    );
    return this.vehicleModel.findByIdAndUpdate(
      id,
      { $set: vehicle },
      { new: true },
    );
  }

  public async checkAuthorization(user: UserPayload, id: string) {
    const vehicle = await this.vehicleModel.findById(id);
    if (!vehicle) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.VEHICLE_NOT_FOUND,
      );
    }
    if (String(vehicle.ownerID) !== user.userID) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.VEHICLE_NOT_FOUND,
      );
    }
    return true;
  }

  // Update vehicle status
  public async updateVehicleStatus(
    dto: UpdateVehicleStatusReqDTO,
    user: UserPayload,
    id: string,
  ) {
    this.logger.debug(
      `VehicleService.updateVehicleStatus() dto: ${JSON.stringify(
        dto,
      )} user: ${JSON.stringify(user)} id: ${id}`,
    );
    await this.isExists(id);
    if (dto.isSelected === true) {
      await this.unSelectAllVehicleForUser(user.userID);
    }
    const vehicle = await this.vehicleModel.findOneAndUpdate(
      { _id: id },
      { $set: { isSelected: dto.isSelected } },
      { new: true },
    );
    return vehicle;
  }

  // Delete vehicle
  public async deleteVehicle(id: string, user: UserPayload) {
    const isAUthorized = await this.checkAuthorization(user, id);
    if (!isAUthorized) {
      throw new CustomHTTPException(
        { key: 'errors.FORBIDDEN' },
        HttpStatus.FORBIDDEN,
        CustomErrorCodes.FORBIDDEN,
      );
    }
    const vehicle = await this.vehicleModel.findById(id);
    if (!vehicle) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.VEHICLE_NOT_FOUND,
      );
    }

    const activeJobs = await this.jobService.getActiveJobsForDriverByUserId(
      user.userID,
    );

    if (activeJobs.length > 0) {
      if (vehicle.isSelected === true) {
        throw new CustomHTTPException(
          { key: 'errors.CAN_NOT_DELETE_SELECTED_VEHICLE_ACTIVE_JOB' },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.CAN_NOT_DELETE_SELECTED_VEHICLE_ACTIVE_JOB,
        );
      }
    }

    await this.vehicleModel.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true },
    );
    return {
      isDelete: true,
    };
  }

  public async selectVehicleById(id: string) {
    const isExist = await this.vehicleModel.findById(id);
    return isExist;
  }

  private async unSelectAllVehicleForUser(userID: string) {
    await this.vehicleModel.updateMany(
      { ownerID: userID },
      { $set: { isSelected: false } },
    );
  }

  public async deleteVehicleByUserId(userID: string) {
    await this.vehicleModel.updateMany(
      { ownerID: new Types.ObjectId(userID) },
      { $set: { isDeleted: true } },
    );
  }

  public async getActiveVehicleByUserId(userID: string) {
    return await this.vehicleModel.findOne({
      ownerID: userID,
      isSelected: true,
    });
  }

  public async getVehicleById(id: string) {
    return await this.vehicleModel.findById(id);
  }

  public async getVehicleCountByUserId(userID: string) {
    return await this.vehicleModel.countDocuments({
      ownerID: new Types.ObjectId(userID),
      isDeleted: false,
    });
  }

  public async isExists(id: string) {
    const isExist = await this.selectVehicleById(id);
    if (!isExist) {
      throw new CustomHTTPException(
        { key: 'errors.NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.VEHICLE_NOT_FOUND,
      );
    }
    return true;
  }
}
