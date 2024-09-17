/**
 * Splash Admin setting  response DTO (For Driver and Merchant)
 */

import { PickType } from '@nestjs/swagger';
import { AdminSetting } from '../entity/admin-settings.entity';

export class SplashAminSettingSwaggerResponseDTO extends PickType(
  AdminSetting,
  [
    'minimumJobPrice',
    'pickupBufferTimeInMinutes',
    'findNearbyDriversWithinMiles',
    'deliveryBufferInPercentage',
    'makeJobPublicAfterSentToNoOfDrivers',
    'sendJobToNextNearestDriverInSeconds',
  ],
) {}
