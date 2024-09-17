import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/app/users/entity/user.entity';
import mongoose from 'mongoose';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type MerchantPayableDocument = MerchantPayable & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class MerchantPayable {
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

  @Prop({ required: true, type: 'object' })
  @IsNumber()
  @ApiProperty()
  jobCount: { [amount: string]: number };

  @Prop()
  @IsString()
  @IsOptional()
  @ApiProperty()
  month: string;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const MerchantPayableSchema =
  SchemaFactory.createForClass(MerchantPayable);
