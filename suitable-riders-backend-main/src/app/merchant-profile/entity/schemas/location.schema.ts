import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class Location {
  @Prop({ required: true })
  @IsArray()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({ type: [Number, Number] })
  coordinates: [number, number];

  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;
}
