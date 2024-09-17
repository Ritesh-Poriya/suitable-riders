import { ApiResponseProperty } from '@nestjs/swagger';

export class DeleteSubscriptionTransactionResDTO {
  @ApiResponseProperty()
  deleted: boolean;
}
