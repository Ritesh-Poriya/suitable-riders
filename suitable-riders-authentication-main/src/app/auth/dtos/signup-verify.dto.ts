import { PickType } from '@nestjs/mapped-types';
import { ApiProperty, PickType as PickTypeSwagger } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../../users/entity/user.entity';
import { LogInResDTO } from './login.dto';

export class SignUpVerifyDTO extends PickType(User, [
  'email',
  'username',
] as const) {
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  readonly otp: string;

  @IsString()
  @IsNotEmpty()
  firebaseIdToken: string;
}

export class SignUpVerifySwaggerDTO extends PickTypeSwagger(User, [
  'email',
  'username',
] as const) {
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @ApiProperty()
  readonly otp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firebaseIdToken: string;
}

export class SignUpVerifyResDTO extends LogInResDTO {}
