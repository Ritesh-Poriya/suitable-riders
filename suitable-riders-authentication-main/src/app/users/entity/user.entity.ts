import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Document } from 'mongoose';
import { ApprovalStatus } from '../@types/approval-status';
import { UserRole } from '../@types/user-role-type';
import { UserStatus } from '../@types/user-status-types';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @Prop({ required: true })
  @Type(() => String)
  @Transform((value) => {
    value.obj[value.key] = value.value.toLowerCase();
    return value.value.toLowerCase();
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  @ApiProperty()
  email: string;

  @Prop()
  @ApiProperty()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[s()+-]*([0-9][s()+-]*){12}$/, {
    message: 'Please enter a valid phone number',
  })
  phoneNo: string;

  @Prop({ required: true, type: String, enum: Object.values(UserRole) })
  role: UserRole;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  })
  @ApiProperty()
  status?: UserStatus;

  @Prop({
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Prop({ type: String, default: '' })
  @IsOptional()
  @IsString()
  profileImage: string;

  @Prop()
  @IsOptional()
  @IsDateString()
  lastLogin: Date;

  @Prop()
  @IsString()
  @IsOptional()
  password: string;
}

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
