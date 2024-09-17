import { ApiResponseProperty } from '@nestjs/swagger';
/**
 * Driver Job count DTO
 */
export class DriverJobCountResDTO {
  @ApiResponseProperty()
  totalJobCount: number;
  @ApiResponseProperty()
  totalCompletedJobCount: number;
  @ApiResponseProperty()
  totalCancelledJobCount: number;
}
