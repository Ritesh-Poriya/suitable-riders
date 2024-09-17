import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteUserResDTO {
  @ApiResponseProperty()
  deleted: boolean;
  @ApiResponseProperty()
  message: string;
}
