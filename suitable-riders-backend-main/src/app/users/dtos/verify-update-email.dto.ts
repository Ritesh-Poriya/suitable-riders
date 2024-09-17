import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUpdateEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  uid: string;
}
