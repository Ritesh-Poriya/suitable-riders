import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/app/users/entity/user.entity';
import mongoose from 'mongoose';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type MerchantPayoutDocument = MerchantPayout & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class MerchantPayout {
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

  @Prop()
  @IsString()
  @IsOptional()
  @ApiProperty()
  note: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  paymentDate: Date;
}

export const MerchantPayoutSchema =
  SchemaFactory.createForClass(MerchantPayout);
