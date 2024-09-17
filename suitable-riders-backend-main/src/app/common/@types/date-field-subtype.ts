import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DateFields {
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $eq?: Date;
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $ne?: Date;
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $gt?: Date;
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $lt?: Date;
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $gte?: Date;
  @IsDate()
  @Transform((value) => new Date(value.value))
  @IsOptional()
  $lte?: Date;
}
