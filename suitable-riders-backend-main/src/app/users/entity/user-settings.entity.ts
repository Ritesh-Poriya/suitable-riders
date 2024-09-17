import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export type UserSettingsDocument = UserSettings & Document;

@Schema({ versionKey: false, timestamps: true })
export class UserSettings {
  @Prop({ default: true })
  pushNotification: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', require: true })
  @ApiProperty()
  userID: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
