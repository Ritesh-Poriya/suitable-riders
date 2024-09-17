import { PickType } from '@nestjs/mapped-types';
import { Job } from '../entity/job.entity';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';

/**
 * Create class to represent the create a job schema
 */
export class CreateJobReqDTO extends PickType(Job, [
  'customerName',
  'phoneNumber',
  'postalCode',
  'address',
  'additionalNotes',
  'travellingTime',
  'travellingDistance',
  'pickupTime',
  'deliveryTime',
  'requiredPackageType',
  'preferredVehicle',
  'specialInstruction',
  'jobOfferAmount',
  'preferredPaymentMethod',
  'statusLogs',
  'isDeliveryOnlyForAdults',
  'isFromOutsideRiders',
  'metadata',
  'orderType',
  'orderAmount',
]) {}
export class CreateJobReqSwaggerDTO extends PickTypeSwagger(Job, [
  'customerName',
  'phoneNumber',
  'postalCode',
  'address',
  'additionalNotes',
  'travellingTime',
  'travellingDistance',
  'pickupTime',
  'deliveryTime',
  'requiredPackageType',
  'preferredVehicle',
  'specialInstruction',
  'jobOfferAmount',
  'preferredPaymentMethod',
  'statusLogs',
  'isDeliveryOnlyForAdults',
  'isFromOutsideRiders',
  'metadata',
  'orderType',
  'orderAmount',
]) {}
export class CreateJobResDTO extends Job {
  @ApiResponseProperty()
  _id: string;
}
