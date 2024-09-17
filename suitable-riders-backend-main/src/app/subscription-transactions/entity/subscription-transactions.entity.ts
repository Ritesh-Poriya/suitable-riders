import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Schema, Types } from 'mongoose';
import { MerchantProfile } from 'src/app/merchant-profile/entity/merchant-profile.entity';
import { paymentMode } from '../@types/subscription-transaction.types';

export type SubscriptionTransactionsDocument = SubscriptionTransactions &
  Document;

/**
 * Subscription Transactions schema
 */
@MongooseSchema({ versionKey: false, timestamps: true })
export class SubscriptionTransactions {
  @Prop()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  merchantName: string;

  @Prop()
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  transactionDate: Date;

  @Prop()
  @IsNotEmpty()
  @ApiProperty()
  subscriptionMonth: Date;

  @Prop()
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @Prop({
    enum: Object.values(paymentMode),
  })
  @IsNotEmpty()
  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;

  @Prop()
  @IsOptional()
  @IsString()
  @ApiProperty()
  transactionNotes: string;

  @Prop({})
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  transactionID: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({
    type: Schema.Types.ObjectId,
    ref: 'MerchantProfile',
    require: true,
  })
  @IsNotEmpty()
  @ApiProperty()
  merchantProfileID: Types.ObjectId | MerchantProfile;
}
export const SubscriptionTransactionsSchema = SchemaFactory.createForClass(
  SubscriptionTransactions,
);
