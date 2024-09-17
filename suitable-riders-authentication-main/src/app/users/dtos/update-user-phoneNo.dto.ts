import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateUserPhoneNoDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty()
  phoneNo: string;
}
