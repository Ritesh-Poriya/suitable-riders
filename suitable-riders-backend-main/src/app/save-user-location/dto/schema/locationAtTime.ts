import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, ValidateNested } from 'class-validator';
import { Location } from 'src/app/merchant-profile/entity/schemas/location.schema';

export class LocationAtTime {
  @ValidateNested()
  @ApiProperty()
  @Type(() => Location)
  @IsNotEmpty()
  location: Location;
  @IsDate()
  @ApiProperty()
  @Type(() => Date)
  timeStamp: Date;
}
