import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from './@types/user-role-type';
import { ParseUserRolePipe } from './pipes/ParseUserRolePipe';
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/user-param.decorator';
import {
  UpdateEmailDto,
  UpdateEmailResDTO,
  UpdateEmailSwaggerDto,
} from './dtos/update-email.dto';
import { Public } from '../common/decorators/public-route.decorator';
import { UpdatePhoneDto } from './dtos/update-phone.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import {
  VerifyUpdateEmailDto,
  VerifyUpdateEmailSwaggerDto,
} from './dtos/verify-update-email.dto';
import { UpdateUserPhoneNoDto } from './dtos/update-user-phoneNo.dto';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { DeleteUserResDTO } from './dtos/delete-user.dto';
import { User } from './entity/user.entity';
import {
  UpdateStatusReqDTO,
  UpdateStatusSwaggerReqDTO,
  UpdateStatusSwaggerResDTO,
} from './dtos/disable-user-by-admin.dto';
import {
  UpdateUserSettingsReqDTO,
  UpdateUserSettingsResDTO,
} from './dtos/update-user-setting.dto';
import { GetUserSettingsResDTO } from './dtos/get-user-settings.dto';
import {
  CreateManagerAdminReqDTO,
  CreateManagerAdminReqSwaggerDTO,
  CreateManagerAdminResDTO,
} from './dtos/create-manager-admin.dto';
import { WrongOTPError } from '../common/errors/WrongOTP.error';
import { RateLimitError } from '../blocking/decorators/rate-limit-error.decorator';
import { ParseContactPipe } from './pipes/parse-contact-pipe';
@Controller('api/users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Roles(UserRole.ADMIN)
  @Delete('/:role/:id')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteUserResDTO })
  @CommonApiResponses()
  async deleteUser(
    @Param('role', ParseUserRolePipe)
    role: UserRole,
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ): Promise<DeleteUserResDTO> {
    return await this.userService.deleteUser(role, id, user);
  }

  @Patch('/phoneNo')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @CommonApiResponses()
  async updatePhoneNo(
    @Body() updatePhoneDto: UpdatePhoneDto,
    @GetUser() user: UserPayload,
  ): Promise<User> {
    return await this.userService.updatePhoneNo(updatePhoneDto, user);
  }

  @Roles(UserRole.ADMIN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @Patch('/phoneNo/:id')
  @ApiTags('user')
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Only for admin',
  })
  @CommonApiResponses()
  async updateUsersPhoneNo(
    @Param('id') id: string,
    @Body() updatePhoneDto: UpdateUserPhoneNoDto,
  ): Promise<User> {
    return await this.userService.updateUsersPhoneNo(
      id,
      updatePhoneDto.phoneNo,
    );
  }

  @Patch('/update-request/email')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateEmailResDTO })
  @HttpCode(HttpStatus.OK)
  @CommonApiResponses()
  @ApiBody({ type: UpdateEmailSwaggerDto })
  async updateEmailRequest(
    @Body() updateEmailDto: UpdateEmailDto,
    @GetUser() user: UserPayload,
  ): Promise<UpdateEmailResDTO> {
    return await this.userService.updateRequestEmail(updateEmailDto, user);
  }

  @Patch('/update-verify/email')
  @ApiTags('user')
  @ApiResponse({ status: HttpStatus.OK, type: User })
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: VerifyUpdateEmailSwaggerDto })
  @CommonApiResponses()
  @RateLimitError({
    limitKey: 'maxWrongOTPTry',
    windowKey: 'wrongOTPRateLimitInMinutes',
    blockDurationKey: 'blockDurForOTPRetryInMinutes',
    Class: WrongOTPError,
  })
  async updateEmailVerify(
    @Body() dto: VerifyUpdateEmailDto,
    @GetUser() user: UserPayload,
  ): Promise<User> {
    return await this.userService.updateEmailVerify(dto, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch('/email/:id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiTags('user')
  @ApiResponse({
    status: HttpStatus.OK,
    type: User,
    description: 'Only for admin',
  })
  @ApiBody({ type: UpdateEmailSwaggerDto })
  @CommonApiResponses()
  async updateEmail(
    @Param('id') id: string,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<User> {
    return await this.userService.updateEmail(id, updateEmailDto.email);
  }

  @Public()
  @ApiTags('user')
  @Get('/is-user-exist/:contact')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @CommonApiResponses()
  async isUserExist(
    @Param('contact', ParseContactPipe) contact: string,
    @Query('role', ParseUserRolePipe) role: UserRole,
  ): Promise<boolean> {
    return await this.userService.isUserExist(contact, role);
  }

  @Roles(UserRole.ADMIN)
  @Patch('/status/:userID')
  @ApiTags('user')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateStatusSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateStatusSwaggerResDTO })
  @CommonApiResponses()
  /**
   * Account disabled by Admin
   */
  async accountDisabledByAdmin(
    @Param('userID') userID: string,
    @Body() dto: UpdateStatusReqDTO,
  ) {
    return await this.userService.accountDisabledByAdmin(userID, dto);
  }

  @Put('/user-settings')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateUserSettingsReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateUserSettingsResDTO })
  @CommonApiResponses()
  async updateUserSettings(
    @Body() dto: UpdateUserSettingsReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return await this.userService.updateUserSettings(dto, user);
  }

  @Get('/user-settings')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, type: GetUserSettingsResDTO })
  @CommonApiResponses()
  async getUserSettings(@GetUser() user: UserPayload) {
    return await this.userService.getUserSettings(user);
  }

  @Roles(UserRole.ADMIN)
  @Post('/manager-admin')
  @ApiTags('user')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateManagerAdminReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: CreateManagerAdminResDTO })
  @CommonApiResponses()
  async createManagerAdmin(@Body() dto: CreateManagerAdminReqDTO) {
    return await this.userService.createManagerAdmin(dto);
  }
}
