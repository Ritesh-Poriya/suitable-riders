import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
import { User } from '../../users/entity/user.entity';
import { Location } from '../../merchant-profile/entity/schemas/location.schema';

export type SaveUserLocationDocument = SaveUserLocation & mongoose.Document;

/**
 * Represent the structure of the save user location
 */
@Schema({ timestamps: true, versionKey: false })
export class SaveUserLocation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true })
  userID: mongoose.Schema.Types.ObjectId | User;

  @Prop({ required: true, type: Location })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => Location)
  location: Location;

  /**
   * This id is used for only save driver location test api
   */
  @Prop()
  @ApiProperty()
  location_id: string;
}
/**
 * Save user location schema
 */
export const SaveUserLocationSchema =
  SchemaFactory.createForClass(SaveUserLocation);
