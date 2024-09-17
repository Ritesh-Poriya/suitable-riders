import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Version,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonApiResponses } from '../common/decorators/common-sagger.decorator';
import { Public } from '../common/decorators/public-route.decorator';
import { GetUser } from '../common/decorators/user-param.decorator';
import { JobEventType } from '../job/@types/job-type';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { GetNotificationByIDSwaggerRes } from './dto/get-notification-by-id.dto';
import {
  GetNotificationReqDTO,
  GetNotificationSwaggerRes,
} from './dto/get-notification-swagger-res.dto';
import { IsCheckSendFoodIsReadyNotificationResDTO } from './dto/isChecksendFoodIsReadyNotificatioRes.dto';
import { SendFoodIsReadyNotificationResDTO } from './dto/sendFoodIsReadyNotificationRes.dto';
import { NotificationService } from './notification.service';

/**
 * Controller of notification
 */
@Controller({ path: 'api/notification', version: ['0', '1'] })
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get notification by user Id
   */
  @Version('0')
  @Post('/search')
  @ApiTags('Notification')
  @ApiResponse({ status: HttpStatus.OK, type: GetNotificationSwaggerRes })
  @CommonApiResponses()
  public async getAll(
    @GetUser() user: UserPayload,
    @Body() dto: GetNotificationReqDTO,
  ) {
    return this.notificationService.getAll(user.userID, dto);
  }

  /**
   * Mark all notification as read
   */
  @Version('0')
  @Patch('/')
  @ApiTags('Notification')
  @ApiResponse({ status: HttpStatus.OK, type: GetNotificationSwaggerRes })
  @CommonApiResponses()
  public async readAll(@GetUser() user: UserPayload) {
    return this.notificationService.readAll(user.userID);
  }

  /**
   * Send test notification
   */
  @Version('0')
  @Public()
  @ApiTags('Notification')
  @Post('/sendTestNotification/:userID')
  public async sendTestNotification(@Param('userID') userID: string) {
    return this.notificationService.sendTestNotification(userID);
  }

  /**
   * Send FOOD_IS_READY notification
   */
  @Version('0')
  @Post('/sendFoodIsReadyNotification/:jobID')
  @ApiTags('Notification')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SendFoodIsReadyNotificationResDTO,
  })
  @CommonApiResponses()
  async sendFoodIsNotification(@Param('jobID') jobID: string) {
    const notification = this.eventEmitter.emit(
      JobEventType.FOOD_IS_READY,
      jobID,
    );
    return notification ? true : false;
  }

  /**
   * Is check FOOD_IS_READY notification sent or not
   */
  @Version('0')
  @Get('/isCheckFoodIsReadyNotificationSent/:jobID')
  @ApiTags('Notification')
  @ApiResponse({
    status: HttpStatus.OK,
    type: IsCheckSendFoodIsReadyNotificationResDTO,
  })
  @CommonApiResponses()
  public async iSCheckFoodIsReadyNotificationSent(
    @Param('jobID') jobID: string,
  ) {
    return await this.notificationService.isCheckFoodIsReadyNotificationSent(
      jobID,
    );
  }

  /**
   * Get notification by Id
   */
  @Version('0')
  @Get('/:id')
  @ApiTags('Notification')
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetNotificationByIDSwaggerRes,
  })
  @CommonApiResponses()
  public async getNotificationByID(
    @Param('id') id: string,
    @GetUser() user: UserPayload,
  ) {
    return this.notificationService.getNotificationByID(id, user);
  }
}
