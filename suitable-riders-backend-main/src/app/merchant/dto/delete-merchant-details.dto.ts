import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteMerchantResDTO {
  @ApiResponseProperty()
  deleted: boolean;
}
