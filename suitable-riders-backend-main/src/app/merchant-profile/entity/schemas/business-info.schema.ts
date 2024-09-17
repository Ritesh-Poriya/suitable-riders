import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApprovalStatus } from 'src/app/common/@types/approval-status';
import { environment } from 'src/environments';
import { BusinessEntityType } from '../../@types/business-entity.type';
import { AddressObject } from './address.schema';
/**
 * Business Info Schema
 */
export class BusinessInfo {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  businessName: string;

  @Prop()
  @IsOptional()
  @IsString()
  @ApiProperty()
  profileImage: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @Matches(environment.phoneNumberPattern, {
    message: 'Please enter a valid phone number',
  })
  @ApiProperty()
  phoneNo: string;

  @Prop({ required: true, type: AddressObject })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => AddressObject)
  address?: AddressObject;

  @Prop({
    default: BusinessEntityType.LIMITED_COMPANY,
    enum: Object.values(BusinessEntityType),
  })
  @ApiProperty()
  @IsEnum(BusinessEntityType)
  @IsNotEmpty()
  businessEntity: BusinessEntityType;

  @Prop({
    default: ApprovalStatus.PENDING,
    enum: Object.values(ApprovalStatus),
  })
  @ApiProperty()
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  businessStatus: ApprovalStatus;
}
