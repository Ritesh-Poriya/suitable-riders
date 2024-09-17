import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/app/users/entity/user.entity';
import mongoose from 'mongoose';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  DriverAvailabilityStatus,
  DriverProfileStatus,
  VerificationStatus,
} from '../@types/driver-profile-status-types';
import { DocsVerificationStatus } from './schemas/docs-verification-status.schema';
import { DriverAddress } from './schemas/driver-address.schema';
import { DriverSubscription } from './schemas/driver-subscription.schema';

export type DriverProfileDocument = DriverProfile & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class DriverProfile {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  profileImage: string;

  @Prop()
  @IsString()
  licenseDocument: string;

  @Prop()
  @IsString()
  @IsOptional()
  @ApiProperty()
  licenseNumber: string;

  @Prop()
  @IsString()
  @IsOptional()
  @ApiProperty()
  workPermit: string; // National Insurance Number

  @Prop()
  @IsString()
  @IsOptional()
  workPermitDocument: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  ownerID: User;

  @Prop({
    type: String,
    enum: Object.values(DriverProfileStatus),
    default: DriverProfileStatus.ACTIVE,
  })
  @ApiProperty()
  @IsEnum(DriverProfileStatus)
  status: DriverProfileStatus;

  @Prop()
  @IsString()
  @ApiProperty()
  driverNumber: string;

  @Prop({
    type: String,
    enum: Object.values(DriverAvailabilityStatus),
    default: DriverAvailabilityStatus.UNAVAILABLE,
  })
  @ApiProperty()
  @IsEnum(DriverAvailabilityStatus)
  availabilityStatus: DriverAvailabilityStatus;

  @Prop()
  @IsString()
  @IsOptional()
  addressDocument?: string;

  @Prop({
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.SUBMITTED,
  })
  @ApiProperty()
  @IsEnum(VerificationStatus)
  verificationStatus: VerificationStatus;

  @Prop({
    required: true,
    type: DocsVerificationStatus,
    default: {
      vehicle: { status: VerificationStatus.SUBMITTED, message: '' },
      license: { status: VerificationStatus.SUBMITTED, message: '' },
      address: { status: VerificationStatus.SUBMITTED, message: '' },
    },
  })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => DocsVerificationStatus)
  docsVerificationStatus: DocsVerificationStatus;

  @Prop({ required: true, type: DriverAddress })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => DriverAddress)
  address: DriverAddress;

  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  @Prop({ default: false, type: Boolean })
  isPassportProvided?: boolean;

  @Prop()
  @IsString()
  @IsOptional()
  @ApiProperty()
  stripeID: string;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;

  @Prop({ required: true, type: DriverSubscription, default: undefined })
  @IsOptional()
  @ApiProperty()
  @Type(() => DriverSubscription)
  subscription?: DriverSubscription;
}

export const DriverProfileSchema = SchemaFactory.createForClass(DriverProfile);
