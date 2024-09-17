import { ApiResponseProperty } from '@nestjs/swagger';

export class DriverRevenueResDTO {
  @ApiResponseProperty()
  last30DaysRevenue: [];
}
