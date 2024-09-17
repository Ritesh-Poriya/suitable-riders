import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteVehicleResDTO {
  @ApiResponseProperty()
  isDeleted: boolean;
}
