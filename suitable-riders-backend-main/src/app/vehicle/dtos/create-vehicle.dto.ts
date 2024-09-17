import { PickType } from '@nestjs/mapped-types';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { Vehicle } from '../entity/vehicle.entity';

export class CreateVehicleReqDTO extends PickType(Vehicle, [
  'vehicleType',
  'vehicleRegistrationNumber',
  'brandMakeModelYear',
  'motDocument',
  'vehicleBusinessInsuranceDocument',
]) {}

export class CreateVehicleReqSwaggerDTO extends PickTypeSwagger(Vehicle, [
  'vehicleType',
  'vehicleRegistrationNumber',
  'brandMakeModelYear',
  'motDocument',
  'vehicleBusinessInsuranceDocument',
]) {}

export class CreateVehicleResDTO extends Vehicle {
  @ApiResponseProperty()
  _id: string;
}
