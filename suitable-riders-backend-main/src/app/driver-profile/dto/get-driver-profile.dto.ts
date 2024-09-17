import { ApiResponseProperty } from '@nestjs/swagger';
import { CreateDriverProfileResDTO } from './create-driver-profile.dto';

export class GetDriverProfileResDTO {
  @ApiResponseProperty()
  driverProfile: CreateDriverProfileResDTO;
  @ApiResponseProperty()
  vehicleCount: number;
}
