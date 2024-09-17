import { ApiResponseProperty } from '@nestjs/swagger';

export class GetMerchantProfileNotificationsResDTO {
  @ApiResponseProperty()
  notifications: boolean;
  @ApiResponseProperty()
  totalCount: number;
}
