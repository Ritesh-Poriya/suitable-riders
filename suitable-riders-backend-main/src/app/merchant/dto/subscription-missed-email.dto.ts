import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class SendSubscriptionEmailReqDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  subscriptionDate: Date;
}
