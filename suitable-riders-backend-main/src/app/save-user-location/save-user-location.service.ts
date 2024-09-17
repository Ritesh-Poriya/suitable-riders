import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { DriverAvailabilityStatus } from '../driver-profile/@types/driver-profile-status-types';
import { SaveUserLocationDemoReqDTO } from './dto/save-user-location-demo.dto';
import { UserDocument } from '../users/entity/user.entity';
import { SaveUserLocationReqDTO } from './dto/save-user-location.dto';
import {
  SaveUserLocation,
  SaveUserLocationDocument,
} from './entity/save-user-location.entity';
import { PreferredVehicle } from '../job/@types/job-type';
import { UserRole } from '../users/@types/user-role-type';
import moment from 'moment';

/**
 * Services of save user location
 */
@Injectable()
export class SaveUserLocationServices {
  constructor(
    @InjectModel(SaveUserLocation.name)
    private saveUserLocation: Model<SaveUserLocationDocument>,
    @InjectConnection()
    private connection: Connection,
    private logger: Logger,
  ) {}

  /**
   * Function to save user location
   */
  public async saveLocation(
    dto: SaveUserLocationReqDTO,
    user: {
      userID: string;
    },
  ) {
    this.logger.debug(
      `SaveUserLocationServices.saveLocation() userID: ${
        user.userID
      } dto: ${JSON.stringify(dto)}`,
    );
    const isExist = await this.saveUserLocation.findOne({
      userID: user.userID,
    });
    let location: SaveUserLocationDocument;
    if (isExist) {
      location = await this.saveUserLocation.findOneAndUpdate(
        {
          userID: user.userID,
        },
        {
          $set: {
            location:
              dto.locationAtTime[dto.locationAtTime.length - 1].location,
          },
        },
        { new: true },
      );
    } else {
      location = await this.saveUserLocation.create({
        ...dto,
        userID: user.userID,
        location: dto.locationAtTime[dto.locationAtTime.length - 1].location,
      });
    }
    this.connection.collection('locationLogs').insertOne({
      body: dto,
      response: location,
      createdAt: new Date(),
    });
    return location;
  }

  /**
   *  Function to save driver location (Test api)
   */
  public async saveDriverLocationTest(
    id: string,
    dto: SaveUserLocationDemoReqDTO,
  ) {
    this.logger.debug(
      `SaveUserLocationServices.saveDriverLocationTest() id: ${id} dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const isExist = await this.saveUserLocation.findOne({
      location_id: id,
    });
    let location: SaveUserLocationDocument;
    if (isExist) {
      location = await this.saveUserLocation.findOneAndUpdate(
        {
          location_id: id,
        },
        {
          $set: {
            location:
              dto.locationAtTime[dto.locationAtTime.length - 1].location,
          },
        },
        { new: true },
      );
    } else {
      location = await this.saveUserLocation.create({
        ...dto,
        location_id: id,
        location: dto.locationAtTime[dto.locationAtTime.length - 1].location,
      });
    }
    this.connection.collection('locationLogs').insertOne({
      location_id: id,
      body: dto,
      response: location,
      createdAt: new Date(),
    });
    return location;
  }

  /**
   * Function to get location logs
   */
  public async getLocationLogs(id: string) {
    this.logger.debug(`SaveUserLocationServices.getLocationLogs() id: ${id}`);
    const data = await this.connection
      .collection('locationLogs')
      .find({ location_id: id })
      .sort({ createdAt: -1 })
      .toArray();
    const count = await this.connection
      .collection('locationLogs')
      .find({ location_id: id })
      .sort({ createdAt: -1 })
      .count();

    return {
      data: data,
      count: count,
    };
  }

  public async getDriversListNearToJobPickupLocation(
    lat: number,
    lng: number,
    radius: number,
    deriverIDsToExclude: Types.ObjectId[],
    preferredVehicleType = Object.values(PreferredVehicle),
  ) {
    this.logger.debug(
      `SaveUserLocationServices.getDriversListNearToJobPickupLocation() is called with lat: ${lat}, lng: ${lng}, radius: ${radius}, deriverIDsToExclude: ${deriverIDsToExclude}, preferredVehicleType: ${preferredVehicleType}`,
    );
    const date = moment(new Date());
    const dateToCheck = date.subtract(1, 'hour').toDate();
    this.logger.debug(
      `SaveUserLocationServices.getDriversListNearToJobPickupLocation() dateToCheck: ${dateToCheck}`,
    );
    return this.saveUserLocation.aggregate<UserDocument>([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          maxDistance: radius,
          distanceField: 'distance',
        },
      },
      {
        $match: {
          userID: {
            $nin: deriverIDsToExclude,
          },
          updatedAt: {
            $gte: dateToCheck,
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userID',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      {
        $addFields: {
          'user.distance': '$distance',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$user',
        },
      },
      {
        $match: {
          role: UserRole.DRIVER,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: 'ownerID',
          as: 'vehicle',
        },
      },
      {
        $unwind: {
          path: '$vehicle',
        },
      },
      {
        $match: {
          'vehicle.isSelected': true,
          'vehicle.isDeleted': false,
          'vehicle.vehicleType': {
            $in: preferredVehicleType,
          },
        },
      },
      {
        $lookup: {
          from: 'driverprofiles',
          localField: '_id',
          foreignField: 'ownerID',
          as: 'driverProfile',
        },
      },
      {
        $unwind: {
          path: '$driverProfile',
        },
      },
      {
        $addFields: {
          availabilityStatus: '$driverProfile.availabilityStatus',
        },
      },
      {
        $unset: ['driverProfile'],
      },
      {
        $match: {
          availabilityStatus: DriverAvailabilityStatus.AVAILABLE,
        },
      },
    ]);
  }
}
