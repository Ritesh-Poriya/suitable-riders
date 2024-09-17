import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
/**
 * Address object schema
 */
export class DriverAddress {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lineOne: string;

  @Prop({ default: '' })
  @IsOptional()
  @IsString()
  @ApiProperty()
  lineTwo?: string;

  @Prop({ default: '' })
  @IsOptional()
  @IsString()
  @ApiProperty()
  cityOrTown?: string;

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  postalCode: string;
}
