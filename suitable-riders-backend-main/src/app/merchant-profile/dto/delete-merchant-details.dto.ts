import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteMerchantDetailsResDTO {
  @ApiResponseProperty()
  deleted: boolean;
}
