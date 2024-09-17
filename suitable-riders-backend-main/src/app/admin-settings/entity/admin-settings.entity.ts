import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsSemVer, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
import { MinimumJobPriceSchema } from './schemas/minimum-job-price.schema';

export type AdminSettingsDocument = AdminSetting & mongoose.Document;

/***
 * Define entity of admin settings
 */
@Schema({ timestamps: true, versionKey: false, collection: 'adminSettings' })
export class AdminSetting {
  @Prop({ type: MinimumJobPriceSchema })
  @ValidateNested()
  @ApiProperty()
  @Type(() => MinimumJobPriceSchema)
  minimumJobPrice?: MinimumJobPriceSchema[];

  @Prop()
  @IsNumber()
  @ApiProperty()
  sendJobToNextNearestDriverInSeconds: number;

  @Prop()
  @IsNumber()
  @ApiProperty()
  makeJobPublicAfterSentToNoOfDrivers: number;

  @Prop()
  @IsNumber()
  @ApiProperty()
  findNearbyDriversWithinMiles: number;

  @Prop()
  @IsNumber()
  @ApiProperty()
  deliveryBufferInPercentage: number;

  @Prop()
  @IsNumber()
  @ApiProperty()
  deliveryBufferInMinutes: number;

  @Prop()
  @IsNumber()
  @ApiProperty()
  pickupBufferTimeInMinutes: number;

  @Prop()
  @IsNumber()
  distanceMultiplierFactor: number;

  @Prop()
  @IsBoolean()
  @ApiProperty()
  isDayLightSavingEnabled: boolean;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  androidSoftUpdateMerchant: string;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  androidHardUpdateMerchant: string;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  androidSoftUpdateRider: string;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  androidHardUpdateRider: string;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  iOSSoftUpdate: string;

  @Prop()
  @IsSemVer()
  @ApiProperty()
  iOSHardUpdate: string;

  @Prop()
  @IsNumber()
  @ApiProperty()
  paginationCount: number;
}

/**
 * Define Admin setting schema
 */
export const AdminSettingsSchema = SchemaFactory.createForClass(AdminSetting);
