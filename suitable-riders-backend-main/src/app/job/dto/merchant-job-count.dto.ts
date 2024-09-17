import { ApiResponseProperty } from '@nestjs/swagger';
/**
 * Merchant job count DTO
 */
export class MerchantJobCountResDTO {
  @ApiResponseProperty()
  totalJobCount: number;
  @ApiResponseProperty()
  totalCompletedJobCount: number;
  @ApiResponseProperty()
  totalCancelledJobCount: number;
  @ApiResponseProperty()
  totalExpiredJobCount: number;
  @ApiResponseProperty()
  totalSpend: number;
  @ApiResponseProperty()
  totalPlatformFees: number;
}
