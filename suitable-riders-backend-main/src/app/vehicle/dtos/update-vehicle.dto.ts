import { PartialType } from '@nestjs/mapped-types';
import { PartialType as PartialTypeSwagger } from '@nestjs/swagger';
import {
  CreateVehicleReqDTO,
  CreateVehicleReqSwaggerDTO,
  CreateVehicleResDTO,
} from './create-vehicle.dto';

export class UpdateVehicleReqDTO extends PartialType(CreateVehicleReqDTO) {}

export class UpdateVehicleSwaggerReqDTO extends PartialTypeSwagger(
  CreateVehicleReqSwaggerDTO,
) {}

export class UpdateVehicleResDTO extends CreateVehicleResDTO {}
