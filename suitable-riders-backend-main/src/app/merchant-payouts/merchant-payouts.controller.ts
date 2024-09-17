import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { MerchantPayoutsService } from './merchant-payouts.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/@types/user-role-type';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  createMerchantPayoutReqDto,
  createMerchantPayoutReqSwaggerDto,
} from './dto/create-merchant-payout.dto';
import { MerchantBalanceResDTO } from './dto/merchant-balance.dto';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';

@Controller({ path: 'api/merchant-payouts', version: ['0', '1'] })
export class MerchantPayoutsController {
  constructor(private merchantPayoutsService: MerchantPayoutsService) {}

  @Roles(UserRole.ADMIN)
  @Post('/')
  @ApiTags('Merchant Payouts')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: createMerchantPayoutReqSwaggerDto })
  async createPayout(@Body() dto: createMerchantPayoutReqDto) {
    return this.merchantPayoutsService.createPayout(dto);
  }

   /**
   * Get merchant current balance.
   */
   @Roles(UserRole.ADMIN)
   @Get('merchant-balance/:merchantID')
   @ApiTags('Merchant Payouts')
   @ApiHeader({
     name: 'Authorization',
     description: 'Access-token',
   })
   @ApiResponse({ status: HttpStatus.OK, type: MerchantBalanceResDTO })
   @CommonApiResponses()
   public async getMerchantBalance(@Param('merchantID') merchantID: string) {
     return await this.merchantPayoutsService.getMerchantBalance(merchantID);
   }
  
}
