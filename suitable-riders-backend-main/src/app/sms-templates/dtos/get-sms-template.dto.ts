import { ApiResponseProperty } from '@nestjs/swagger';
import { SmsTemplates } from '../entity/sms-templates.entity';

export class GetSmsTemplateResDTO {
  @ApiResponseProperty()
  data: SmsTemplates[];
}
