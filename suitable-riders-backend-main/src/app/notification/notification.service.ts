import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { Model, Types } from 'mongoose';
import { DeviceService } from '../device/device.service';
import { FirebaseFCMService } from '../firebase/firebase-fcm.service';
import { FCMNotificationType } from '../firebase/@types/FCMNotificationType';
import {
  Notification,
  NotificationDocument,
} from './entity/notification.entity';
import { FCMNotificationFactory } from './fcm-notification.factory';
import {
  NotificationNotes,
  NotificationType,
} from './@type/notification-type.enum';
import { environment } from 'src/environments';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { GetNotificationReqDTO } from './dto/get-notification-swagger-res.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private fcmService: FirebaseFCMService,
    private deviceService: DeviceService,
    private logger: Logger,
  ) {}

  /**
   * Function to create new notification
   */
  public async createNotification(userID: string, message: MulticastMessage) {
    this.logger.debug(
      `NotificationService.createNotification() with arg userID: ${userID} and message: ${message}`,
    );
    return this.notificationModel.create({
      userID: new Types.ObjectId(userID),
      payload: {
        notification: {
          title: message.data.title,
          body: message.data.body,
        },
        data: {
          details: JSON.parse(message.data.details),
          notificationType: message.data.notificationType,
          image: message.data.image,
        },
      },
    });
  }

  /**
   * Function to get notification by userID
   */
  public async getAll(userID, dto: GetNotificationReqDTO) {
    this.logger.debug(
      `NotificationService.getAll() with arg userID: ${userID}`,
    );
    const notifications = await this.notificationModel
      .aggregate([
        {
          $match: {
            userID: new Types.ObjectId(userID),
            disabled: false,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: dto.options.skip,
        },
        {
          $limit: dto.options.limit,
        },
      ])
      .exec();
    await this.notificationModel.updateMany(
      {
        userID: new Types.ObjectId(userID),
      },
      {
        $set: { isRead: true },
      },
    );
    return {
      data: notifications,
    };
  }

  /**
   * Function to make all notification as read
   */
  public async readAll(userID) {
    this.logger.debug(
      `NotificationService.readAll() with arg userID: ${userID}`,
    );
    await this.notificationModel.updateMany(
      {
        userID: new Types.ObjectId(userID),
      },
      {
        $set: { isRead: true },
      },
    );
  }

  /**
   * Function to send notification
   */
  public async sendNotificationToUsers(
    userIDs: string[],
    notification: FCMNotificationType,
    toSendPushNotification = true,
    toStoreInDB = true,
  ) {
    this.logger.debug(
      'sendNotificationToUsers() with arg notification: ',
      notification,
    );
    this.logger.debug('sendNotificationToUsers() with arg userIDs: ', userIDs);
    this.logger.debug(
      'sendNotificationToUsers() with arg toSendPushNotification: ',
      toSendPushNotification,
    );
    this.logger.debug(
      'sendNotificationToUsers() with arg toStoreInDB: ',
      toStoreInDB,
    );
    for (const userID of userIDs) {
      const notificationTokens = await this.getNotificationTokens([userID]);
      this.logger.debug(notificationTokens);
      let message = FCMNotificationFactory.create(
        notification,
        notificationTokens,
      );
      this.logger.debug(
        'sendNotificationToUsers() constructed message: ',
        message,
      );
      if (toStoreInDB) {
        const dbNotification = await this.createNotification(userID, message);
        message = await this.addNotificationIdToMessagePayload(
          message,
          dbNotification._id,
        );
      }
      if (toSendPushNotification && notificationTokens.length > 0) {
        const res = await this.fcmService.sendNotification(message);
        this.logger.debug('sendNotificationToUsers() FCM response: ', res);
      }
    }
  }
  /**
   *  Function to add notification ID to message payload
   */
  public addNotificationIdToMessagePayload(
    message: MulticastMessage,
    notificationID: Types.ObjectId,
  ): MulticastMessage {
    this.logger.debug(
      `NotificationService.addNotificationIdToMessagePayload() with arg message: ${message} and notificationID: ${notificationID}`,
    );
    const details = JSON.parse(message.data.details);
    message.data.details = JSON.stringify({
      ...details,
      notificationID: String(notificationID),
    });
    return message;
  }

  /**
   * Function to get notification token
   */

  private async getNotificationTokens(userIDs: string[]): Promise<string[]> {
    this.logger.debug(
      `NotificationService.getNotificationTokens() with arg userIDs: ${userIDs}`,
    );
    return this.deviceService.getNotificationTokensFromUser(userIDs);
  }

  /**
   * Function to send Test notification
   */
  public async sendTestNotification(userID: string) {
    this.logger.debug(
      `NotificationService.sendTestNotification() with arg userID: ${userID}`,
    );
    const testNotification: FCMNotificationType = {
      type: NotificationType.TEST,
      details: {
        name: 'test notification',
        jobNumber: '#10013',
      },
      image: `${environment.SRUrl}/media/images/platform/riders_logo.png`,
    };
    await this.sendNotificationToUsers([userID], testNotification, true, false);
    return true;
  }

  /**
   * Function to check FOOD_IS_READY notification set or not
   */

  public async isCheckFoodIsReadyNotificationSent(jobID: string) {
    this.logger.debug(
      `NotificationService.isCheckFoodIsReadyNotificationSent() with arg jobID: ${jobID}`,
    );
    const isExistNotification = await this.notificationModel.findOne({
      'payload.data.notificationType': NotificationType.FOOD_IS_READY,
      'payload.data.details.jobID': jobID,
    });
    if (isExistNotification) {
      return true;
    }
    return false;
  }

  public async disableJobAvailableNotification(
    jobID: Types.ObjectId,
    driverID: Types.ObjectId,
  ): Promise<void> {
    this.logger.debug(
      `NotificationService.disableJobAvailableNotification() with arg jobID: ${jobID}`,
    );
    await this.notificationModel.updateMany(
      {
        'payload.data.details.jobID': String(jobID),
        'payload.data.notificationType': NotificationType.NEW_JOB_AVAILABLE,
        userID: { $ne: driverID },
      },
      {
        $set: {
          disabled: true,
          notes: NotificationNotes.JOB_ACCEPTED_BY_DRIVER,
        },
      },
    );
  }

  public async disableJobNotification(
    jobID: Types.ObjectId,
    notes: NotificationNotes,
  ) {
    this.logger.debug(
      `NotificationService.disableJobNotification() with arg jobID: ${jobID} and notes: ${notes}`,
    );
    await this.notificationModel.updateMany(
      {
        'payload.data.details.jobID': String(jobID),
        'payload.data.notificationType': NotificationType.NEW_JOB_AVAILABLE,
      },
      {
        $set: {
          disabled: true,
          notes: notes,
        },
      },
    );
  }

  public async disableJobNotificationByDriverID(
    driverID: string,
    jobID: string,
    notes: NotificationNotes,
  ) {
    this.logger.debug(
      `NotificationService.disableJobNotificationByDriverID() with arg driverID: ${driverID} and jobID: ${jobID} and notes: ${notes}`,
    );
    await this.notificationModel.updateOne(
      {
        'payload.data.notificationType': NotificationType.NEW_JOB_AVAILABLE,
        'payload.data.details.jobID': jobID,
        userID: new Types.ObjectId(driverID),
      },
      {
        $set: {
          disabled: true,
          notes: notes,
        },
      },
    );
  }

  public async getMyJobsIdsFromNotifications(userID: string) {
    this.logger.debug(
      `NotificationService.getMyJobsIdsFromNotifications() with arg userID: ${userID}`,
    );
    const notifications = await this.notificationModel.find({
      userID: new Types.ObjectId(userID),
      disabled: false,
      'payload.data.notificationType': NotificationType.NEW_JOB_AVAILABLE,
    });
    const jobIds = notifications.map(
      (notification) =>
        new Types.ObjectId(notification.payload.data.details.jobID),
    );
    this.logger.debug(
      `NotificationService.getMyJobsIdsFromNotifications() with arg jobIds: ${jobIds}`,
    );
    return jobIds.map((jobId) => new Types.ObjectId(jobId));
  }

  public async getNotificationByID(id: string, user: UserPayload) {
    this.logger.debug(
      `NotificationService.getNotificationByID() with arg id: ${id}`,
    );
    const notification = await this.notificationModel.findOne({
      _id: new Types.ObjectId(id),
      userID: new Types.ObjectId(user.userID),
    });
    this.logger.debug(
      `NotificationService.getNotificationByID() with notification: ${notification}`,
    );
    if (!notification) {
      throw new CustomHTTPException(
        {
          key: 'errors.NOTIFICATION_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.NOTIFICATION_NOT_FOUND,
      );
    }
    return {
      data: notification,
    };
  }
}
