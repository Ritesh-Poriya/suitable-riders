import { PickType } from '@nestjs/mapped-types';
import { Job } from '../entity/job.entity';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';

/**
 * Create class to represent the unableToDeliver a job
 */
export class UnableToDeliverJobReqDTO extends PickType(Job, [
  'unableToDeliverReason',
  'unableToDeliverReasonDescription',
  'unableToDeliverReasonAttachment',
]) {}

export class UnableToDeliverJobSwaggerReqDTO extends PickTypeSwagger(Job, [
  'unableToDeliverReason',
  'unableToDeliverReasonDescription',
  'unableToDeliverReasonAttachment',
]) {}

export class UnableToDeliverJobResDTO {
  @ApiResponseProperty()
  unableToDeliver: boolean;
}
