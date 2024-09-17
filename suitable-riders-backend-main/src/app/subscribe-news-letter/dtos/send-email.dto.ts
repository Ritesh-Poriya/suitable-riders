import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendEmailReqDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  content: string;
}
