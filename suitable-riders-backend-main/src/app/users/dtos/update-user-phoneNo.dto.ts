import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateUserPhoneNoDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNo: string;
}
