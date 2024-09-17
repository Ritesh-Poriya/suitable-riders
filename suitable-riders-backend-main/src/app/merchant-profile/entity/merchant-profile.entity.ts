import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/app/users/entity/user.entity';
import mongoose from 'mongoose';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApprovalStatus } from 'src/app/common/@types/approval-status';
import { BusinessInfo } from './schemas/business-info.schema';

export type MerchantProfileDocument = MerchantProfile & mongoose.Document;

@Schema({ timestamps: true, versionKey: false })
export class MerchantProfile {
  @Prop({ required: true, type: BusinessInfo })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => BusinessInfo)
  businessInfo?: BusinessInfo;

  @Prop({ required: true, type: Object })
  @IsNotEmpty()
  @ApiProperty()
  photoIDInfo: {
    photoID: string;
    photoIDStatus: ApprovalStatus;
  };

  @Prop({ required: true, type: Object })
  @IsNotEmpty()
  @ApiProperty()
  VATCertificateInfo: {
    VATCertificate: string;
    VATCertificateStatus: ApprovalStatus;
  };

  @Prop({ required: true, type: Object })
  @IsNotEmpty()
  @ApiProperty()
  TaxCertificateInfo: {
    TaxCertificate: string;
    TaxCertificateStatus: ApprovalStatus;
  };

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  ownerID: User;

  @Prop()
  @IsString()
  @ApiProperty()
  merchantNumber: string;

  @Prop()
  @IsString()
  @ApiProperty()
  businessID: string;

  @Prop({ default: false })
  isContractAccepted: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  @IsString()
  @ApiProperty()
  @IsOptional()
  rejectionReason: string;
}

export const MerchantProfileSchema =
  SchemaFactory.createForClass(MerchantProfile);
