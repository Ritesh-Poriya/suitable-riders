import { ApiResponseProperty } from '@nestjs/swagger';

export class deleteDeviceResDTO {
  @ApiResponseProperty()
  isDeleted: boolean;
}
