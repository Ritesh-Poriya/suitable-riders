import { PickType } from '@nestjs/mapped-types';
import { Job } from '../entity/job.entity';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';

/**
 * Create class to represent the cancel a job
 */
export class CancelJobReqDTO extends PickType(Job, [
  'cancelReason',
  'reasonDescription',
  'cancelReasonAttachment',
]) {}
export class CancelJobSwaggerReqDTO extends PickTypeSwagger(Job, [
  'cancelReason',
  'reasonDescription',
  'cancelReasonAttachment',
]) {}
export class CancelJobResDTO {
  @ApiResponseProperty()
  cancelled: boolean;
}
