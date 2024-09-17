import { ApiResponseProperty } from '@nestjs/swagger';

export class IsCheckSendFoodIsReadyNotificationResDTO {
  @ApiResponseProperty()
  is_sent_notification: boolean;
}
