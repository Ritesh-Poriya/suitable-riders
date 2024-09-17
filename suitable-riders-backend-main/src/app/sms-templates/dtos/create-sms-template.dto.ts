import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { SmsTemplates } from '../entity/sms-templates.entity';

export class CreateSmsTemplateReqDTO extends PickType(SmsTemplates, [
  'message',
  'isIDProofTemplate',
  'coTemplateID'
]) {}

export class CreateSmsTemplateResDTO extends SmsTemplates {
  @ApiResponseProperty()
  _id: string;
}
