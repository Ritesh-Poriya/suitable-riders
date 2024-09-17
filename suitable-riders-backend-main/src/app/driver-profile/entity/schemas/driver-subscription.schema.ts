import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import Stripe from 'stripe';
/**
 * Address object schema
 */
export class DriverSubscription {
  @Prop({ default: '' })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: string;

  @Prop({ default: new Date(1970) })
  @ApiProperty()
  startTime: Date;

  @Prop({ default: new Date(1970) })
  @ApiProperty()
  endTime: Date;

  @Prop({ default: 'trialing' })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  status: Stripe.Subscription.Status;
}
