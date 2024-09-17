import { PickType } from '@nestjs/swagger';
import { User } from '../entity/user.entity';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';

/**
 * Update merchant subscription request DTO
 */
export class UpdateMerchantSubscriptionReqDTO extends PickType(User, [
  'isSubscriptionActive',
]) {}
/**
 * Update merchant subscription swagger request DTO
 */
export class UpdateMerchantSubscriptionSwaggerReqDTO extends PickTypeSwagger(
  User,
  ['isSubscriptionActive'],
) {}
