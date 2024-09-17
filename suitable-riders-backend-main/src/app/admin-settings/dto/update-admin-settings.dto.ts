import { PartialType, PickType } from '@nestjs/mapped-types';
import {
  PartialType as PartialTypeSwagger,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { AdminSetting } from '../entity/admin-settings.entity';

/**
 * Update admin setting DTO
 */

export class UpdateAdminSettingsDTO extends PartialType(
  PickType(AdminSetting, [
    'pickupBufferTimeInMinutes',
    'sendJobToNextNearestDriverInSeconds',
    'deliveryBufferInPercentage',
    'deliveryBufferInMinutes',
    'findNearbyDriversWithinMiles',
    'minimumJobPrice',
    'makeJobPublicAfterSentToNoOfDrivers',
    'distanceMultiplierFactor',
    'isDayLightSavingEnabled',
    'androidHardUpdateMerchant',
    'androidSoftUpdateMerchant',
    'androidHardUpdateRider',
    'androidSoftUpdateRider',
    'iOSHardUpdate',
    'iOSSoftUpdate',
    'paginationCount',
  ]),
) {}

/**
 * Update admin setting swagger DTO
 */
export class UpdateAdminSettingsSwaggerDTO extends PartialTypeSwagger(
  PickTypeSwagger(AdminSetting, [
    'pickupBufferTimeInMinutes',
    'sendJobToNextNearestDriverInSeconds',
    'deliveryBufferInPercentage',
    'deliveryBufferInMinutes',
    'findNearbyDriversWithinMiles',
    'minimumJobPrice',
    'makeJobPublicAfterSentToNoOfDrivers',
    'distanceMultiplierFactor',
    'isDayLightSavingEnabled',
    'androidHardUpdateMerchant',
    'androidSoftUpdateMerchant',
    'androidHardUpdateRider',
    'androidSoftUpdateRider',
    'iOSHardUpdate',
    'iOSSoftUpdate',
    'paginationCount',
  ]),
) {}
