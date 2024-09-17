import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
/***
 * Define entity of Minimum job price
 */
export class MinimumJobPriceSchema {
  @Prop()
  @ApiProperty()
  @IsNumber()
  minimumMiles: number;

  @Prop()
  @ApiProperty()
  @IsNumber()
  maximumMiles: number;

  @Prop()
  @ApiProperty()
  @IsNumber()
  minimumCharge: number;
}
