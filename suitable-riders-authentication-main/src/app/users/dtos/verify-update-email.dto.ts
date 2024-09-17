import { PickType } from '@nestjs/mapped-types';
import { ApiProperty, PickType as PickTypeSwagger } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class VerifyUpdateEmailDto extends PickType(User, ['email'] as const) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string;
}

export class VerifyUpdateEmailSwaggerDto extends PickTypeSwagger(User, [
  'email',
] as const) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string;
}
