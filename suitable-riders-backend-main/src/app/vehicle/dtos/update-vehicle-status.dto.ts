import { PickType } from '@nestjs/mapped-types';
import { PickType as PickTypeSwagger } from '@nestjs/swagger';
import { Vehicle } from '../entity/vehicle.entity';
import { UpdateVehicleResDTO } from './update-vehicle.dto';

export class UpdateVehicleStatusReqDTO extends PickType(Vehicle, [
  'isSelected',
]) {}

export class UpdateVehicleStatusReqSwaggerDTO extends PickTypeSwagger(Vehicle, [
  'isSelected',
]) {}

export class UpdateVehicleStatusResDTO extends UpdateVehicleResDTO {}
