import { ApiResponseProperty } from '@nestjs/swagger';

export class SendFoodIsReadyNotificationResDTO {
  @ApiResponseProperty()
  notification: boolean;
}
