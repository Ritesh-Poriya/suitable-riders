import { PartialType } from '@nestjs/mapped-types';
import { PartialType as PartialTypeSwagger } from '@nestjs/swagger';
import { CreateJobReqDTO, CreateJobResDTO } from './create-job.dto';

/**
 * Create class to represent the update a job schema
 */
export class UpdateJobReqDTO extends PartialType(CreateJobReqDTO) {}

export class UpdateJobReqSwaggerDTO extends PartialTypeSwagger(
  CreateJobReqDTO,
) {}

export class UpdateJobResDTO extends CreateJobResDTO {
  _id: string;
  statusLogs: [];
}
