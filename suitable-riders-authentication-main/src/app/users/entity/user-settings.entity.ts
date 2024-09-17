import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type UserSettingsDocument = UserSettings & Document;
/**
 * User setting schema
 */
@Schema({ versionKey: false, timestamps: true })
export class UserSettings {
  @Prop({ default: true })
  pushNotification: boolean;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'User',
  })
  userID: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
