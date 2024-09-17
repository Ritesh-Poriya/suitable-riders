import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { VerificationStatus } from '../../@types/driver-profile-status-types';
import { IsEnum } from 'class-validator';

export class VerificationStatusObject {
  @Prop({
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.SUBMITTED,
  })
  @ApiProperty()
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @Prop({ default: '' })
  @IsString()
  @ApiProperty()
  message: string;
}
