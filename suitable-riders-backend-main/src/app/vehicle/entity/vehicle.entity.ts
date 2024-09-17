import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleTypes } from '../@types/vehicle-types';
import { User } from 'src/app/users/entity/user.entity';

export type VehicleDocument = Vehicle & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class Vehicle {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Prop({
    type: String,
    enum: Object.values(VehicleTypes),
  })
  vehicleType: VehicleTypes;

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  vehicleRegistrationNumber: string;

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  brandMakeModelYear: string;

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  motDocument: string;

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  vehicleBusinessInsuranceDocument: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  ownerID: User;

  @Prop({})
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  vehicleNumber: string;

  @Prop({ default: false, type: Boolean })
  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  isSelected: boolean;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
