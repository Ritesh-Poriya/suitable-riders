import { FCMNotificationType } from '../firebase/@types/FCMNotificationType';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { INotification } from '../firebase/@types/INotification';
import { NotificationType } from './@type/notification-type.enum';
import { VerificationStatus } from '../driver-profile/@types/driver-profile-status-types';
import { PreferredPaymentMethod } from '../job/@types/job-type';

export class FCMNotificationFactory {
  public static create(
    notification: FCMNotificationType,
    tokens: string[],
  ): MulticastMessage {
    const notificationText = this.buildNotification(notification);
    return {
      tokens: tokens,
      data: {
        body: notificationText.body,
        title: notificationText.title,
        sound: 'default',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        notificationType: notification.type,
        image: notification.image,
        details: JSON.stringify(notification.details),
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
            alert: {
              title: notificationText.title,
              body: notificationText.body,
            },
            sound: 'default',
          },
        },
      },
      android: {
        priority: 'high',
      },
    };
  }

  /**
   *  build notification based on notification type
   */
  private static buildNotification(
    notification: FCMNotificationType,
  ): INotification {
    const fcmNotification: INotification = {
      title: '',
      body: '',
      icon: 'ic_notification',
    };
    switch (notification.type) {
      case NotificationType.NEW_JOB_AVAILABLE:
        fcmNotification.title = `New Job Available`;
        fcmNotification.body = `A new Job #${notification.details.jobNumber} is available for delivery by ${notification.details.businessName}.`;
        break;
      case NotificationType.JOB_CANCELLED_BY_MERCHANT:
        fcmNotification.title = `Job Cancelled by Merchant`;
        fcmNotification.body = `The Job #${notification.details.jobNumber} has been cancelled by ${notification.details.merchantName}.`;
        break;
      case NotificationType.FOOD_IS_READY:
        fcmNotification.title = `Food is Ready`;
        fcmNotification.body = `The food is ready to be picked up for the Job #${notification.details.jobNumber}`;
        break;
      case NotificationType.JOB_ACCEPTED:
        fcmNotification.title = `Job Accepted`;
        fcmNotification.body = `Your Job #${
          notification.details.jobNumber
        } has been accepted by ${notification.details.driverName}${
          notification.details.preferredPaymentMethod ==
          PreferredPaymentMethod.EITHER_CARD
            ? ' and selected Card as the payment method'
            : notification.details.preferredPaymentMethod ==
              PreferredPaymentMethod.EITHER_CASH
            ? ' and selected Cash as the payment method'
            : ''
        }.`;
        break;
      case NotificationType.RIDER_HAS_ARRIVED:
        fcmNotification.title = `Rider has arrived`;
        fcmNotification.body = `${notification.details.driverName} has arrived at the restaurant for job #${notification.details.jobNumber}.`;
        break;
      case NotificationType.ORDER_PICKED_UP_BY_MERCHANT:
        fcmNotification.title = `Order Pickedup`;
        fcmNotification.body = `Your Job #${notification.details.jobNumber} has been marked as picked up by ${notification.details.merchantName}.`;
        break;
      case NotificationType.ORDER_PICKED_UP_BY_DRIVER:
        fcmNotification.title = `Order Pickedup`;
        fcmNotification.body = `Your Job #${notification.details.jobNumber} has been picked up by ${notification.details.driverName}.`;
        break;
      case NotificationType.ORDER_DELIVERED:
        fcmNotification.title = `Order Delivered`;
        fcmNotification.body = `Your Job #${notification.details.jobNumber} has been delivered by ${notification.details.driverName}.`;
        break;
      case NotificationType.JOB_CANCELLED_BY_DRIVER:
        fcmNotification.title = `Job Cancelled by Driver`;
        fcmNotification.body = `Your Job #${notification.details.jobNumber} has been cancelled by ${notification.details.driverName}.`;
        break;
      case NotificationType.JOB_UNABLE_TO_DELIVER:
        fcmNotification.title = `Rider is unable to deliver`;
        fcmNotification.body = `The Rider, ${notification.details.driverName} is unable to deliver the order for the job #${notification.details.jobNumber} because of the following reason: \n${notification.details.unableToDeliverReason}`;
        break;
      case NotificationType.DOC_VERIFICATION_STATUS_UPDATED:
        if (
          notification.details.verificationStatus == VerificationStatus.APPROVED
        ) {
          fcmNotification.title = `Profile Approved`;
          fcmNotification.body = `Your rider profile has been activated. You can now start accepting the jobs`;
        } else {
          fcmNotification.title = `Profile Rejected`;
          fcmNotification.body = `Your rider profile has few problems. You can check and resubmit them for the activation process before accepting jobs`;
        }
        break;
      case NotificationType.TEST:
        fcmNotification.title = `Test Notification`;
        fcmNotification.body = `Test ${notification.details.name}.`;
        break;
      default:
        break;
    }
    return fcmNotification;
  }
}
