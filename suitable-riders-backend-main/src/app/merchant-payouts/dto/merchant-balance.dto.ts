import { ApiResponseProperty } from '@nestjs/swagger';

export class MerchantBalanceResDTO {
  @ApiResponseProperty()
  ballancePayable: number;
}
