import { ApiProperty } from '@nestjs/swagger';

export class GetNearByDriversCountResDTO {
  @ApiProperty()
  driversCount: number;
}
