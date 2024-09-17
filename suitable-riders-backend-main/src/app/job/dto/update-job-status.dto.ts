import { PickType } from '@nestjs/mapped-types';
import { ApiProperty, PickType as PickTypeSwagger } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { Job } from '../entity/job.entity';
import { UpdateJobResDTO } from './update-job.dto';

/**
 * Create class to represent the update status of a job schema
 */
export class UpdateJobStatusReqDTO extends PickType(Job, [
  'jobStatus',
  'jobDeliveredImage',
  'preferredPaymentMethod',
]) {
  @IsOptional()
  @Matches(/^[0-9]{2}$/, { message: 'Invalid OTP' })
  @IsString()
  @ApiProperty()
  otp: string;
}

export class UpdateJobStatusReqSwaggerDTO extends PickTypeSwagger(Job, [
  'jobStatus',
  'jobDeliveredImage',
  'preferredPaymentMethod',
]) {}

export class UpdateJobStatusResDTO extends UpdateJobResDTO {
  _id: string;
  statusLogs: [];
}
