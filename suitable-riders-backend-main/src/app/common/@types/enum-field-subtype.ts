import { IsDate, IsOptional } from 'class-validator';

export class EnumFields {
  @IsOptional()
  $eq?: string;

  @IsOptional()
  $ne?: string;

  @IsOptional()
  $in?: string[];
}
