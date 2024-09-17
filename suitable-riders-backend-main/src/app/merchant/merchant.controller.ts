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
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from '../users/@types/user-role-type';
import {
  UpdateMerchantSubscriptionReqDTO,
  UpdateMerchantSubscriptionSwaggerReqDTO,
} from '../users/dtos/update-merchant-subscription.dto';
import { UsersService } from '../users/users.service';
import { DeleteMerchantResDTO } from './dto/delete-merchant-details.dto';
import { SendSubscriptionEmailReqDTO } from './dto/subscription-missed-email.dto';
import { MerchantService } from './merchant.service';

@Controller({ path: 'api/merchant', version: ['0', '1'] })
export class MerchantController {
  constructor(
    private userService: UsersService,
    private merchantService: MerchantService,
  ) {}

  /**
   * Subscribe merchant
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Patch('/subscription/:userID')
  @ApiTags('Merchant')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateMerchantSubscriptionSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @CommonApiResponses()
  public async updateUserSubscription(
    @Param('userID') userID: string,
    @Body() dto: UpdateMerchantSubscriptionReqDTO,
  ) {
    return await this.userService.updateUserSubscription(
      userID,
      dto.isSubscriptionActive,
    );
  }

  /**
   * Is subscription active
   */
  @Version('0')
  @Roles(UserRole.MERCHANT)
  @Get('/isSubscribe')
  @ApiTags('Merchant')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  public async isSubscription(@GetUser() user: UserPayload) {
    return await this.userService.isSubscription(user.userID);
  }

  // Delete merchant by token
  @Version('0')
  @Delete('')
  @ApiTags('Merchant')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteMerchantResDTO,
  })
  @CommonApiResponses()
  async deleteMerchant(@GetUser() user: UserPayload) {
    return this.merchantService.deleteMerchantByUserID(user.userID);
  }

  // Delete merchant by userID
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Delete('/:userID')
  @ApiTags('Merchant')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteMerchantResDTO,
  })
  @CommonApiResponses()
  async deleteMerchantByUserID(@Param('userID') userID: string) {
    return this.merchantService.deleteMerchantByUserID(userID);
  }

  //Send subscription missed email
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('/subscription-missed-email/:userID')
  @ApiTags('Merchant')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Boolean,
  })
  @CommonApiResponses()
  async sendSubscriptionMissedEmail(
    @Param('userID') userID: string,
    @Body() dto: SendSubscriptionEmailReqDTO,
  ) {
    return await this.merchantService.sendSubscriptionMissedEmail(userID, dto);
  }
}
