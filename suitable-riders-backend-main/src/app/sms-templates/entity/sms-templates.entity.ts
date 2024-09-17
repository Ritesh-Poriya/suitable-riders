import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type SmsTemplatesDocument = SmsTemplates & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class SmsTemplates {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  message: string;

  @ApiProperty()
  @IsOptional()
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmsTemplates',
  })
  coTemplateID?: SmsTemplates;

  @Prop({ default: false })
  @ApiProperty()
  @IsOptional()
  isIDProofTemplate: Boolean;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;
}
export const SmsTemplatesSchema = SchemaFactory.createForClass(SmsTemplates);
