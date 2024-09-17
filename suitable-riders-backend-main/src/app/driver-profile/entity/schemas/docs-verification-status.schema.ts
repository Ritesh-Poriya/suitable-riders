import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VerificationStatusObject } from './verification-status.schema';

export class DocsVerificationStatus {
  @Prop({ required: true, type: VerificationStatusObject })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => VerificationStatusObject)
  vehicle: VerificationStatusObject;

  @Prop({ required: true, type: VerificationStatusObject })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => VerificationStatusObject)
  license: VerificationStatusObject;

  @Prop({ required: true, type: VerificationStatusObject })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => VerificationStatusObject)
  address: VerificationStatusObject;
}
