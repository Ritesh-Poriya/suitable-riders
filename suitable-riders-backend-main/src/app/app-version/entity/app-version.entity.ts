import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsSemVer,
} from 'class-validator';
import mongoose from 'mongoose';
import { AppType, VersionOsType } from 'src/app/common/@types/version-type';

export type AppVersionDocument = AppVersion & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class AppVersion {
  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  @IsSemVer()
  versionNo: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  supportedApiVersionNo: number;

  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(VersionOsType)
  os: VersionOsType;

  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(AppType)
  appType: AppType;

  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  publishedDate: Date;

  @Prop({ default: false, type: Boolean })
  @ApiProperty()
  isDeleted?: boolean;
}

export const AppVersionSchema = SchemaFactory.createForClass(AppVersion);
