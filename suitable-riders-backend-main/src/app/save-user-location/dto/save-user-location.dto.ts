import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { SaveUserLocation } from '../entity/save-user-location.entity';
import { LocationAtTime } from './schema/locationAtTime';

/**
 * Request DTO Of Save User Location
 */
export class SaveUserLocationReqDTO {
  @IsArray()
  @ApiProperty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LocationAtTime)
  locationAtTime: LocationAtTime[];
}

/**
 * Response DTO Of Save User Location
 */
export class SaveUserLocationResDTO extends SaveUserLocation {}
