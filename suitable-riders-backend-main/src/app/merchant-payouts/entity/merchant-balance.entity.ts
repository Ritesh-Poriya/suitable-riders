import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/app/users/entity/user.entity';
import mongoose from 'mongoose';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type MerchantBalanceDocument = MerchantBalance & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class MerchantBalance {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  merchantID: User;

  @Prop({ required: true })
  @IsNumber()
  @ApiProperty()
  amount: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const MerchantBalanceSchema =
  SchemaFactory.createForClass(MerchantBalance);
