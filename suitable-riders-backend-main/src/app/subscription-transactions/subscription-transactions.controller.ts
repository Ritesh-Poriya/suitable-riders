import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import {
  CreateSubscriptionTransactionReqDTO,
  CreateSubscriptionTransactionResDTO,
} from './dto/create-subscription.dto';
import { DeleteSubscriptionTransactionResDTO } from './dto/delete-subscription.dto';
import {
  searchSubscriptionTransactionReqDTO,
  searchSubscriptionTransactionResDTO,
} from './dto/search-subscription.dto';
import {
  UpdateSubscriptionTransactionReqDTO,
  UpdateSubscriptionTransactionResDTO,
} from './dto/update-subscription.dto';
import { SubscriptionTransactionsServices } from './subscription-transactions.services';

/**
 * Subscription controller
 */
@Controller({ path: 'api/subscription-transaction', version: ['0', '1'] })
export class SubscriptionTransactionsController {
  constructor(private subscriptionServices: SubscriptionTransactionsServices) {}

  /**
   * Create subscription
   */
  @Version('0')
  @Post('/')
  @ApiTags('SubscriptionTransaction')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateSubscriptionTransactionResDTO,
  })
  @CommonApiResponses()
  public async createSubscription(
    @Body() dto: CreateSubscriptionTransactionReqDTO,
  ) {
    return await this.subscriptionServices.createSubscription(dto);
  }

  /**
   * Update subscription
   */
  @Version('0')
  @Get('/:id')
  @ApiTags('SubscriptionTransaction')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CreateSubscriptionTransactionResDTO,
  })
  @CommonApiResponses()
  public async getSubscription(@Param('id') id: string) {
    return await this.subscriptionServices.getSubscription(id);
  }

  /**
   * Update subscription
   */
  @Version('0')
  @Patch('/:id')
  @ApiTags('SubscriptionTransaction')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateSubscriptionTransactionResDTO,
  })
  @CommonApiResponses()
  public async updateSubscription(
    @Body() dto: UpdateSubscriptionTransactionReqDTO,
    @Param('id') id: string,
  ) {
    return await this.subscriptionServices.updateSubscription(id, dto);
  }

  /**
   * search subscription
   */
  @Version('0')
  @Post('/search')
  @ApiTags('SubscriptionTransaction')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: searchSubscriptionTransactionResDTO,
  })
  @CommonApiResponses()
  public async searchSubscription(
    @Body() dto: searchSubscriptionTransactionReqDTO,
  ) {
    return await this.subscriptionServices.searchSubscription(dto);
  }

  /**
   * Delete subscription
   */
  @Version('0')
  @Delete('/:id')
  @ApiTags('SubscriptionTransaction')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteSubscriptionTransactionResDTO,
  })
  @CommonApiResponses()
  public async deleteSubscription(@Param('id') id: string) {
    return await this.subscriptionServices.deleteSubscription(id);
  }
}
