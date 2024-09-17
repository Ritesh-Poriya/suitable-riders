import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Document } from 'mongoose';
import { environment } from 'src/environments';
import { ApprovalStatus } from '../../common/@types/approval-status';
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
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is not valid' })
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(environment.phoneNumberPattern, {
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
  status?: UserStatus;

  @Prop({ type: String, default: '' })
  @IsOptional()
  @IsString()
  profileImage: string;

  @Prop({
    type: String,
    enum: Object.values(ApprovalStatus),
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Prop()
  @IsOptional()
  @IsDateString()
  lastLogin: Date;

  @Prop({ default: true, type: Boolean })
  @IsBoolean()
  isSubscriptionActive: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
