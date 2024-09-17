import { ApiResponseProperty } from '@nestjs/swagger';
import { Notification } from '../entity/notification.entity';
export class GetNotificationByIDSwaggerRes {
  @ApiResponseProperty()
  data: Notification[];
}
