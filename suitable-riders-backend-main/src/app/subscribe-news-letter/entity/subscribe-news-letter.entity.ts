import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export type SubscribeNewsLetterDocument = SubscribeNewsLetter &
  mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class SubscribeNewsLetter {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;
}
export const SubscribeNewsLetterSchema =
  SchemaFactory.createForClass(SubscribeNewsLetter);
