import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';
import { User } from 'src/app/users/entity/user.entity';
import { NotificationType } from '../@type/notification-type.enum';

export type NotificationDocument = Notification & mongoose.Document;

/**
 * Define entity of notification
 */
@Schema({ timestamps: true, versionKey: false })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true })
  @ApiProperty()
  userID: User | mongoose.Schema.Types.ObjectId;

  @Prop({ require: true, type: Object })
  @ApiProperty()
  payload: {
    notification: {
      title: string;
      body: string;
    };
    data: {
      details: any;
      notificationType: NotificationType;
      image: string;
    };
  };

  @Prop({ default: false })
  @ApiResponseProperty()
  isRead: boolean;

  @Prop({ require: true })
  @ApiResponseProperty()
  toDisplay: boolean;

  @Prop({ default: false })
  @ApiProperty()
  disabled: boolean;

  @Prop({ default: '' })
  @IsString()
  @ApiProperty()
  @IsOptional()
  notes: string;
}

/**
 * Notification schema
 */
export const NotificationSchema = SchemaFactory.createForClass(Notification);
