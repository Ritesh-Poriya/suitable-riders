import { ApiResponseProperty } from '@nestjs/swagger';

export class GetEarningsResDTO {
  @ApiResponseProperty()
  todaysEarning: number;
  @ApiResponseProperty()
  totalEarnings: number;
}
