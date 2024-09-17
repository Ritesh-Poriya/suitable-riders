import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Location } from './location.schema';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
/**
 * Address object schema
 */
export class AddressObject {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  formattedAddress: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  postalCode: string;

  @Prop({ required: true, type: Location })
  @IsNotEmpty()
  @ValidateNested()
  @ApiProperty()
  @Type(() => Location)
  location: Location;

  @Prop()
  @IsOptional()
  @IsString()
  @ApiProperty()
  additionalAddressNotes?: string;
}
