import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteDriverProfileResDTO {
  @ApiResponseProperty()
  isDeleted: boolean;
}
