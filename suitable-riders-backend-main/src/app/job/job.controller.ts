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
  Res,
  Version,
} from '@nestjs/common';
import { Response } from 'express';

import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CheckBlockedUser } from '../common/decorators/checked-blocked-user.decorator';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { UserRole } from '../users/@types/user-role-type';
import {
  CancelJobReqDTO,
  CancelJobResDTO,
  CancelJobSwaggerReqDTO,
} from './dto/cancel-job.dto';
import {
  CreateJobReqDTO,
  CreateJobReqSwaggerDTO,
  CreateJobResDTO,
} from './dto/create-job.dto';
import { DeleteJobResDTO } from './dto/delete-job.dto';
import { GetJobByIDResDTO } from './dto/get-job-by-id.dto';
import { GetJobReqDTO, GetJobResDTO } from './dto/get-job.dto';
import { GetMyJobsReqDTO, GetMyJobsResDTO } from './dto/get-my-jobs.dto';
import {
  UpdateJobStatusReqDTO,
  UpdateJobStatusReqSwaggerDTO,
  UpdateJobStatusResDTO,
} from './dto/update-job-status.dto';
import {
  UpdateJobReqDTO,
  UpdateJobReqSwaggerDTO,
  UpdateJobResDTO,
} from './dto/update-job.dto';
import { JobService } from './job.service';
import { IsSubscriptionActive } from '../common/decorators/is-subscription-active.decorator';
import {
  DriverSearchJobFilterDTO,
  DriverSearchJobFilterResDTO,
} from './dto/driver-search-job.dto';
import { MerchantJobCountResDTO } from './dto/merchant-job-count.dto';
import { DriverJobCountResDTO } from './dto/driver-job-count.dto';
import { DriverRevenueResDTO } from './dto/driver-revenue.dto';
import { GetEarningsResDTO } from './dto/get-earnings.dto';
import {
  UnableToDeliverJobReqDTO,
  UnableToDeliverJobResDTO,
  UnableToDeliverJobSwaggerReqDTO,
} from './dto/unable-to-deliver-job.dto';
import { Public } from '../common/decorators/public-route.decorator';
import { FilterJobReqDTO } from '../dashboard/dto/dashboard.dto';

/**
 * Controller of the Job module
 */
@Controller({ path: 'api/job', version: ['0', '1'] })
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * Create new Job
   */
  @Version('0')
  @Roles(UserRole.MERCHANT)
  @CheckBlockedUser()
  @IsSubscriptionActive()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Post('/')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CreateJobReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: CreateJobResDTO })
  @CommonApiResponses()
  async createJob(@Body() dto: CreateJobReqDTO, @GetUser() user: UserPayload) {
    return this.jobService.createJob(dto, user);
  }

  /**
   * Searches job
   */
  @Version('0')
  @Post('/search')
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetJobResDTO })
  @CommonApiResponses()
  async searchJobs(@Body() dto: GetJobReqDTO, @GetUser() user: UserPayload) {
    return this.jobService.searchJobs(dto, user.role);
  }

  // Get earnings
  @Version('0')
  @Get('/earnings')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetEarningsResDTO })
  @CommonApiResponses()
  async getEarnings(@GetUser() user: UserPayload) {
    return await this.jobService.getEarnings(user.userID);
  }

  /**
   * Get running job by id
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Get('/running')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetJobByIDResDTO })
  @CommonApiResponses()
  async getRunningJOb(@GetUser() user: UserPayload) {
    return this.jobService.getRunningJOb(user.userID);
  }

  /**
   * Get job by user id
   */
  @Version('0')
  @Roles(UserRole.MERCHANT, UserRole.DRIVER)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Post('/me')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetMyJobsResDTO })
  @CommonApiResponses()
  async getJobsByUserId(
    @Body() dto: GetMyJobsReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.jobService.getJobsByUserId(dto, user.userID, user.role);
  }

  /**
   * Get job by id
   */
  @Version('0')
  @Roles(UserRole.DRIVER, UserRole.MERCHANT, UserRole.ADMIN)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Get('/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: GetJobByIDResDTO })
  @CommonApiResponses()
  async getJobById(@Param('id') id: string) {
    return this.jobService.getJobById(id);
  }

  /**
   * Get Rider Coordinations
   */
  @Version('0')
  @Public()
  @CheckBlockedUser()
  @Get('/tracking/:id')
  @ApiTags('Jobs')
  // @ApiResponse({ status: HttpStatus.OK, type: GetJobByIDResDTO })
  @CommonApiResponses()
  async getRiderCoordinations(@Param('id') id: string) {
    return this.jobService.getRidersCoordinationsByOrderID(id);
  }

  /**
   * Update job details by id
   */
  @Version('0')
  @Roles(UserRole.MERCHANT)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Put('/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateJobReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateJobResDTO })
  @CommonApiResponses()
  async updateJobById(@Param('id') id: string, @Body() dto: UpdateJobReqDTO) {
    return this.jobService.updateJobById(id, dto);
  }

  /**
   * Update job status by id
   */
  @Version('0')
  @Roles(UserRole.DRIVER, UserRole.MERCHANT)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Patch('/status/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UpdateJobStatusReqSwaggerDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UpdateJobStatusResDTO })
  @CommonApiResponses()
  async updateJobStatusById(
    @Param('id') id: string,
    @Body() dto: UpdateJobStatusReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.jobService.updateJobStatusById(id, dto, user);
  }

  /**
   * Delete job
   */
  @Version('0')
  @Roles(UserRole.MERCHANT, UserRole.ADMIN)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Delete('/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteJobResDTO })
  @CommonApiResponses()
  async deleteJodById(@Param('id') id: string) {
    return this.jobService.deleteJodById(id);
  }

  /**
   * Cancel job
   */
  @Version('0')
  @Roles(UserRole.MERCHANT)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Patch('/cancel/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: CancelJobSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: CancelJobResDTO })
  @CommonApiResponses()
  async cancelJobById(
    @Param('id') id: string,
    @Body() dto: CancelJobReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.jobService.cancelJobById(id, dto, user);
  }

  // Download invoice
  @Version('0')
  @Roles(UserRole.DRIVER, UserRole.MERCHANT, UserRole.ADMIN)
  @Get('/download-invoice/:JobID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK })
  async downloadInvoice(
    @Param('JobID') JobID: string,
    @Res() res: Response,
    @GetUser() user: UserPayload,
  ): Promise<void> {
    await this.jobService.downloadInvoice(JobID, user.role).then((pdf) => {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=invoice.pdf',
        'Content-Length': pdf.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
      });
      res.end(pdf);
    });
  }

  /**
   * Job declined by driver
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @Post('/declined-job/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @CommonApiResponses()
  async declinedJobByDriver(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ) {
    return await this.jobService.declinedJobByDriver(id, user);
  }

  /**
   * Get Job for driver(Declined job not allowed)
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @Post('/driver/me')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DriverSearchJobFilterResDTO })
  @CommonApiResponses()
  async getMyJob(
    @GetUser() user: UserPayload,
    @Body() dto: DriverSearchJobFilterDTO,
  ) {
    return await this.jobService.getMyJob(user.userID, dto);
  }

  /**
   * Get Job count for single merchant
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('merchant-job-count/:merchantID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: MerchantJobCountResDTO })
  @CommonApiResponses()
  public async getJobCountForMerchant(@Param('merchantID') merchantID: string) {
    return await this.jobService.getJobCountForMerchant(merchantID);
  }

  @Version('0')
  @Roles(UserRole.ADMIN)
  @Post('merchant-job-count/:merchantID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: MerchantJobCountResDTO })
  @CommonApiResponses()
  public async getDashboardDetailsForMerchant(
    @Param('merchantID') merchantID: string,
    @Body() dto: FilterJobReqDTO,
  ) {
    return await this.jobService.getJobCountForMerchant(merchantID, dto.fields);
  }

  /**
   * Get Job count for single driver
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('driver-job-count/:driverID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DriverJobCountResDTO })
  @CommonApiResponses()
  public async getJobCountForDriver(@Param('driverID') driverID: string) {
    return await this.jobService.getJobCountForDriver(driverID);
  }

  /**
   * Get Job count for single driver
   */
  @Version('0')
  @Roles(UserRole.ADMIN)
  @Get('driver-job-revenue/:driverID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: DriverRevenueResDTO })
  @CommonApiResponses()
  public async getJobRevenueForDriver(@Param('driverID') driverID: string) {
    return await this.jobService.getJobRevenueForDriver(driverID);
  }

  /**
   * Send SMS to customer
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @Get('send-SMS/:templateID')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @CommonApiResponses()
  async sendSMS(
    @Param('templateID') templateID: string,
    @GetUser() user: UserPayload,
  ) {
    return await this.jobService.sendSMS(user, templateID);
  }

  /**
   * Resend otp to customer
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @Get('otp/resend-otp')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiResponse({ status: HttpStatus.OK, type: Boolean })
  @CommonApiResponses()
  async resendOTP(@GetUser() user: UserPayload) {
    return await this.jobService.resendOTP(user);
  }

  /**
   * UnableToDeliver job
   */
  @Version('0')
  @Roles(UserRole.DRIVER)
  @CheckBlockedUser()
  @ApiOperation({
    description:
      'Incase of Forbidden error, 2 cases for error codes:\n' +
      '1. User is Blocked By Admin.\n Appropriate error code: user/blocked\n' +
      '2. User has no permission to access this route.\n Appropriate error code: user/forbidden',
  })
  @Patch('/unableToDeliver/:id')
  @ApiTags('Jobs')
  @ApiHeader({
    name: 'Authorization',
    description: 'Access-token',
  })
  @ApiBody({ type: UnableToDeliverJobSwaggerReqDTO })
  @ApiResponse({ status: HttpStatus.OK, type: UnableToDeliverJobResDTO })
  @CommonApiResponses()
  async unableToDeliverJobById(
    @Param('id') id: string,
    @Body() dto: UnableToDeliverJobReqDTO,
    @GetUser() user: UserPayload,
  ) {
    return this.jobService.unableToDeliverJobById(id, dto, user);
  }
}
