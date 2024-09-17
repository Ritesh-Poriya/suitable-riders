import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Types, Document } from 'mongoose';
import { DeviceType } from '../@types/DeviceType';

export type DeviceDocument = Document & Device;

@Schema({ timestamps: true, versionKey: false })
export class Device {
  @Prop({ required: true, ref: 'User', type: Types.ObjectId })
  userID: Types.ObjectId;

  @Prop({ required: true, type: String })
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @Prop({ type: String })
  @ApiProperty()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @Prop({ required: true, type: String })
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  notificationToken: string;

  @Prop({ type: String })
  @ApiProperty()
  @IsString()
  deviceOS?: string;

  @Prop({ type: String })
  @ApiProperty()
  @IsString()
  deviceAppVersion?: string;

  @Prop({ type: String })
  @ApiProperty()
  @IsString()
  deviceModel?: string;

  @Prop({ type: String })
  @ApiProperty()
  @IsString()
  deviceManufacturer?: string;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
