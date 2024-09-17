import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteDriverResDTO {
  @ApiResponseProperty()
  isDeleted: boolean;
}
