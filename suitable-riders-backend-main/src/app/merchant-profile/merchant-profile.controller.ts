import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from '../users/@types/user-role-type';
import {
  CreateMerchantProfileReqDTO,
  CreateMerchantProfileReqSwaggerDTO,
} from './dto/create-merchant-profile.dto';
import {
  UpdateMerchantProfileReqDTO,
  UpdateMerchantProfileReqSwaggerDTO,
  UpdateMerchantProfileResDTO,
} from './dto/update-merchant-profile.dto';
import {
  UpdateMerchantProfileStatusReqDTO,
  UpdateMerchantProfileStatusResDTO,
  UpdateMerchantProfileStatusReqSwaggerDTO,
} from './dto/update-merchant-profile-status.dto';
import { MerchantProfileService } from './merchant-profile.service';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { GetMerchantProfileResDTO } from './dto/get-merchant-profile.dto';
import { CreateMerchantProfileFromSeReqDTO } from './dto/create-merchant-profile-from-se.dto';
import { DeleteMerchantDetailsResDTO } from './dto/delete-merchant-details.dto';
import {
  searchMerchantProfileReqDTO,
  searchMerchantProfileResDTO,
  searchMerchantProfileSwaggerReqDTO,
} from './dto/search-merchant-profile.dto';
import {
  GetRemainingSubscriptionMerchantProfileReqDTO,
  GetRemainingSubscriptionMerchantProfileResDTO,
  GetRemainingSubscriptionMerchantProfileSwaggerReqDTO,
} from './dto/subscription-remaining-merchant-profile.dto';
import { GetMerchantProfileNotificationsResDTO } from './dto/get-merchant-profile-notifications.dto';
import { GetIncompleteMerchantProfileResDTO } from './dto/get-incomplete-merchant-profile.dto';

@Controller({ path: 'api/merchantProfile', version: ['0', '1'] })
export class MerchantProfileController {
  constructor(
    private readonly merchantProfileService: MerchantProfileService,
  ) {}

  /**
   * create merchant profile
   */
  @Version('0')
  @Post('/')
  @ApiTags('Merchant Profile')
  @ApiBody({ type: CreateMerchantProfileReqSwaggerDTO })
  @CommonApiResponses()
  async create(
    @Body() dto: CreateMerchantProfileReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.merchantProfileService.create(dto, user);
  }

  /**
   * Get self merchant profile
   */
  @Version('0')
  @Get('/me')
  @ApiTags('Merchant Profile')
  @ApiResponse({ status: HttpStatus.OK, type: GetMerchantProfileResDTO })
  @CommonApiResponses()
  async getMyMerchantProfile(@GetUser() user: UserPayload) {
    return this.merchantProfileService.getMyMerchantProfile(user.userID);
  }

  /**
   * Get inComplete merchant profile
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/incomplete')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetIncompleteMerchantProfileResDTO,
  })
  @CommonApiResponses()
  async getIncompleteMerchantProfile() {
    return this.merchantProfileService.getIncompleteMerchantProfile();
  }

  /**
   * Get merchant profile by Id
   */
  @Version('0')
  @Get('/:id')
  @ApiTags('Merchant Profile')
  @ApiResponse({ status: HttpStatus.OK, type: GetMerchantProfileResDTO })
  @CommonApiResponses()
  async getMerchant(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.merchantProfileService.getMerchant(id, user);
  }

  /**
   * Update merchantProfile details
   */
  @Version('0')
  @Put('/:id')
  @ApiTags('Merchant Profile')
  @ApiBody({ type: UpdateMerchantProfileReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateMerchantProfileResDTO })
  @CommonApiResponses()
  async updateMerchant(
    @Body() dto: UpdateMerchantProfileReqDTO,
    @GetUser() user: UserPayload,
    @Param('id') id: string,
  ) {
    return this.merchantProfileService.updateMerchant(dto, user, id);
  }

  /**
   * Update merchant profile status
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Patch('/status/:id')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateMerchantProfileStatusReqSwaggerDTO })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateMerchantProfileStatusResDTO,
  })
  @CommonApiResponses()
  async updateStatus(
    @Body() dto: UpdateMerchantProfileStatusReqDTO,
    @Param('id') id: string,
  ) {
    return this.merchantProfileService.updateStatus(dto, id);
  }

  /**
   * Create merchant form suitable eats project api =>"https://dev.suitableeats.com/api/v0/getRestaurantDetails/me"
   */
  @Version('0')
  @Post('/merchant-profile-from-suitable-eats')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @CommonApiResponses()
  async createMerchantFromSe(
    @Body() createMerchantFromSe: CreateMerchantProfileFromSeReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.merchantProfileService.createMerchantFromSe(
      createMerchantFromSe,
      user,
    );
  }

  /**
   * Delete merchant
   */
  @Version('0')
  @Delete('')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: DeleteMerchantDetailsResDTO,
  })
  @CommonApiResponses()
  @ApiOperation({
    deprecated: true,
    summary:
      ' This url is deprecated and will be removed in future, use DELETE /api/merchant/ instead',
  })
  async deleteMerchantByUserId(@GetUser() user: UserPayload) {
    return this.merchantProfileService.deleteMerchantByUserId(user);
  }

  /**
   * Get merchant profile by userID
   */
  @Version('0')
  @Get('/byUser/:userID')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetMerchantProfileResDTO })
  @CommonApiResponses()
  async getMerchantProfileByUserID(@Param('userID') userID: string) {
    return this.merchantProfileService.getMerchantProfileByUserID(userID);
  }

  /**
   * Search Merchant Profile API
   */
  @Version('0')
  @Post('/search')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: searchMerchantProfileSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: searchMerchantProfileResDTO })
  @CommonApiResponses()
  async searchMerchantProfile(@Body() dto: searchMerchantProfileReqDTO) {
    return this.merchantProfileService.searchMerchantProfile(dto);
  }

  /**
   * Get remaining subscription merchant profile API
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('/subscription-remaining')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: GetRemainingSubscriptionMerchantProfileSwaggerReqDTO })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetRemainingSubscriptionMerchantProfileResDTO,
  })
  @CommonApiResponses()
  async getSubscriptionRemainingMerchant(
    @Body() dto: GetRemainingSubscriptionMerchantProfileReqDTO,
  ) {
    return this.merchantProfileService.getSubscriptionRemainingMerchant(dto);
  }

  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('/notifications/display')
  @ApiTags('Merchant Profile')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetMerchantProfileNotificationsResDTO,
  })
  @CommonApiResponses()
  async getNotifications() {
    return this.merchantProfileService.getNotifications();
  }
}
