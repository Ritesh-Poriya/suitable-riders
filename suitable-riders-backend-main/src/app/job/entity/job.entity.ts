import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Types, Document, Schema } from 'mongoose';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  PreferredVehicle,
  PackageType,
  PreferredPaymentMethod,
  JobApprovalStatus,
  OrderType,
} from '../@types/job-type';
import { User } from '../../users/entity/user.entity';
import { MerchantProfile } from 'src/app/merchant-profile/entity/merchant-profile.entity';
import { DriverProfile } from 'src/app/driver-profile/entity/driver-profile.entity';
import { Type } from 'class-transformer';
import { Vehicle } from 'src/app/vehicle/entity/vehicle.entity';
import { environment } from 'src/environments';

export type JobDocument = Job &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };
export class JobStatusLog {
  jobStatus: JobApprovalStatus;
  date: Date;
}
/**
 * Represent the structure of the job module
 */
@MongooseSchema({ timestamps: true, versionKey: false })
export class Job {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  customerName: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @Matches(environment.phoneNumberPattern, {
    message: 'Please enter a valid phone number',
  })
  @ApiProperty()
  phoneNumber: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  postalCode: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  address: string;

  @Prop()
  @IsOptional()
  @IsString()
  @ApiProperty()
  additionalNotes: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  travellingTime: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  travellingDistance: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  pickupTime: Date;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  deliveryTime: Date;

  @Prop({ required: true, type: [String], enum: Object.values(PackageType) })
  @ApiProperty()
  @IsOptional()
  requiredPackageType?: PackageType[];

  @Prop({
    required: true,
    type: [String],
    enum: Object.values(PreferredVehicle),
  })
  @ApiProperty()
  @IsNotEmpty()
  preferredVehicle?: PreferredVehicle[];

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  specialInstruction: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  jobOfferAmount: number;

  @Prop({
    required: true,
    enum: Object.values(PreferredPaymentMethod),
    default: PreferredPaymentMethod.CASH,
  })
  @ApiProperty()
  @IsEnum(PreferredPaymentMethod)
  @IsNotEmpty()
  @IsOptional()
  preferredPaymentMethod: PreferredPaymentMethod;

  @Prop({})
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  jobID: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    default: JobApprovalStatus.PENDING,
    enum: Object.values(JobApprovalStatus),
  })
  @IsEnum(JobApprovalStatus)
  @ApiProperty()
  jobStatus: JobApprovalStatus;

  @Prop({
    jobStatus: { enum: Object.values(JobApprovalStatus) },
    date: Date,
  })
  @ApiProperty({
    type: () => JobStatusLog,
  })
  statusLogs: { jobStatus: JobApprovalStatus; date: Date }[];

  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cancelReason: string;

  @Prop()
  @IsString()
  @ApiProperty()
  reasonDescription: string;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User', require: true })
  userID: Types.ObjectId | User;

  @Prop({ type: Schema.Types.ObjectId, ref: 'User' })
  @ApiProperty()
  driverID: Types.ObjectId | User;

  @Prop({ type: [String], default: [] })
  @IsOptional()
  @ApiProperty()
  cancelReasonAttachment: string[];

  @Prop({
    type: Schema.Types.ObjectId,
    ref: 'MerchantProfile',
    require: true,
  })
  merchantProfileID: Types.ObjectId | MerchantProfile;

  @Prop({
    type: Schema.Types.ObjectId,
    ref: 'DriverProfile',
    require: true,
  })
  driverProfileID: Types.ObjectId | DriverProfile;

  @Prop({ type: Schema.Types.ObjectId, ref: 'Vehicle' })
  usedVehicle: Types.ObjectId | Vehicle;

  @Prop({ default: null })
  @ApiResponseProperty()
  invoiceID: string;

  @Prop({ default: null })
  @ApiProperty()
  @IsOptional()
  sms: string;

  @Prop({ default: null })
  @ApiProperty()
  @IsOptional()
  @IsString()
  otp: string;

  @Prop({ default: null })
  @ApiProperty()
  @IsOptional()
  @IsString()
  jobDeliveredImage: string;

  @Prop({ default: false })
  @ApiProperty()
  @IsOptional()
  isDeliveryOnlyForAdults: Boolean;

  @Prop({ default: false })
  @ApiProperty()
  @IsOptional()
  isFromOutsideRiders: Boolean;

  @Prop({ type: Object })
  @ApiProperty()
  @IsOptional()
  metadata: any;

  @Prop({
    required: true,
    enum: Object.values(OrderType),
    default: OrderType.PREPAID,
  })
  @ApiProperty()
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @Prop()
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  orderAmount?: number;

  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  unableToDeliverReason: string;

  @Prop()
  @IsString()
  @ApiProperty()
  unableToDeliverReasonDescription: string;

  @Prop({ type: [String], default: [] })
  @IsOptional()
  @ApiProperty()
  unableToDeliverReasonAttachment: string[];
}

export const JobSchema = SchemaFactory.createForClass(Job);
