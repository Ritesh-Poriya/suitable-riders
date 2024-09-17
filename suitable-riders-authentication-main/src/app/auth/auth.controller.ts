import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserRole } from 'src/app/users/@types/user-role-type';
import { AuthService } from './auth.service';
import {
  SignUpReqResDTO,
  SignUpRequestDTO,
  SignUpRequestSwaggerDTO,
} from './dtos/signup-request.dto';
import {
  SignUpVerifyDTO,
  SignUpVerifyResDTO,
  SignUpVerifySwaggerDTO,
} from './dtos/signup-verify.dto';
import { RateLimit } from 'src/app/blocking/decorators/rate-limit.decorator';
import { RateLimitError } from 'src/app/blocking/decorators/rate-limit-error.decorator';
import { WrongOTPError } from 'src/app/common/errors/WrongOTP.error';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HEADER_LANG_KEY } from '../common/constants';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { LogInDTO, LogInResDTO } from './dtos/login.dto';
import { Public } from '../common/decorators/public-route.decorator';
import { ParseUserRolePipe } from '../users/pipes/ParseUserRolePipe';
import { CreateAdminDTO } from './dtos/create-admin.dto';
import {
  ManagerAdminLoginReqDTO,
  ManagerAdminLoginReqSwaggerDTO,
  ManagerAdminLoginResDTO,
} from './dtos/login-manager-admin.dto';

@Controller('api/auth')
@ApiHeader({
  name: HEADER_LANG_KEY,
  description: 'Header for internationalization',
})
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup-request/:type')
  @ApiTags('signup')
  @CommonApiResponses()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SignUpRequestSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: SignUpReqResDTO })
  @RateLimit({
    limitKey: 'sendOTPMaxRetry',
    windowKey: 'requestRateLimitInMinutes',
    blockDurationKey: 'blockDurForRetryForMinutes',
  })
  async signupRequest(
    @Body() signupRequestDto: SignUpRequestDTO,
    @Param('type', ParseUserRolePipe) forRole: UserRole,
  ): Promise<any> {
    return this.authService.signupRequest(signupRequestDto, forRole);
  }

  @Public()
  @Post('/signup-verify/:type/:uid')
  @ApiTags('signup')
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SignUpVerifyResDTO,
  })
  @ApiBody({ type: SignUpVerifySwaggerDTO })
  @CommonApiResponses()
  @RateLimitError({
    limitKey: 'maxWrongOTPTry',
    windowKey: 'wrongOTPRateLimitInMinutes',
    blockDurationKey: 'blockDurForOTPRetryInMinutes',
    Class: WrongOTPError,
  })
  async signupVerify(
    @Body() signupVerifyDto: SignUpVerifyDTO,
    @Param('type', ParseUserRolePipe) forRole: UserRole,
    @Param('uid') uid: string,
  ): Promise<any> {
    return this.authService.signupVerify(signupVerifyDto, uid, forRole);
  }

  @Public()
  @Get('/refresh-token/:refreshToken')
  @ApiTags('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: LogInResDTO,
  })
  @CommonApiResponses()
  async loginWithRefreshToken(
    @Param('refreshToken') refreshToken: string,
  ): Promise<any> {
    return this.authService.loginWithRefreshToken(refreshToken);
  }

  @Public()
  @Post('/login/manager-admin')
  @ApiTags('login')
  @CommonApiResponses()
  @ApiResponse({ type: ManagerAdminLoginResDTO, status: HttpStatus.OK })
  @ApiBody({ type: ManagerAdminLoginReqSwaggerDTO })
  @HttpCode(HttpStatus.OK)
  async loginManagerAdmin(
    @Body() dto: ManagerAdminLoginReqDTO,
  ): Promise<ManagerAdminLoginResDTO> {
    return this.authService.loginManagerAdmin(dto);
  }

  @Public()
  @ApiTags('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: LogInResDTO,
  })
  @CommonApiResponses()
  @Post('/login/:type')
  async login(
    @Body() loginDto: LogInDTO,
    @Param('type', ParseUserRolePipe) forRole: UserRole,
  ): Promise<any> {
    return this.authService.handleLogin(loginDto, forRole);
  }
  @Public()
  @ApiTags('signup')
  @CommonApiResponses()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SignUpVerifyResDTO,
  })
  @Post('/admin/signup-with-suitableeats/')
  async createAdmin(@Body() createAdmin: CreateAdminDTO): Promise<any> {
    return this.authService.createAdminRequest(createAdmin);
  }
}
