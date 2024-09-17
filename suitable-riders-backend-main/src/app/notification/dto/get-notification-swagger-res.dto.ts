import { ApiResponseProperty } from '@nestjs/swagger';
import { Filter } from 'src/app/common/@types/custom-query.filter';
import { Notification } from '../entity/notification.entity';

export class GetNotificationReqDTO extends Filter {}
export class GetNotificationSwaggerRes {
  @ApiResponseProperty()
  data: Notification[];
}
