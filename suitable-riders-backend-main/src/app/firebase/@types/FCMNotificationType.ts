import { Types } from 'mongoose';
import { VerificationStatus } from 'src/app/driver-profile/@types/driver-profile-status-types';
import { PreferredPaymentMethod } from 'src/app/job/@types/job-type';
import { NotificationType } from 'src/app/notification/@type/notification-type.enum';
/**
 * Define FCM notification type
 */
export type FCMNotificationType =
  | {
      type: NotificationType.NEW_JOB_AVAILABLE;
      image: string;
      details: {
        jobNumber: string;
        businessName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.JOB_CANCELLED_BY_MERCHANT;
      image: string;
      details: {
        jobNumber: string;
        merchantName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.FOOD_IS_READY;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.JOB_ACCEPTED;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
        preferredPaymentMethod: PreferredPaymentMethod;
      };
    }
  | {
      type: NotificationType.RIDER_HAS_ARRIVED;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.ORDER_PICKED_UP_BY_MERCHANT;
      image: string;
      details: {
        jobNumber: string;
        merchantName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.ORDER_PICKED_UP_BY_DRIVER;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.ORDER_DELIVERED;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.JOB_CANCELLED_BY_DRIVER;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
      };
    }
  | {
      type: NotificationType.DOC_VERIFICATION_STATUS_UPDATED;
      image: string;
      details: {
        ownerID: string;
        verificationStatus: VerificationStatus;
      };
    }
  | {
      type: NotificationType.JOB_UNABLE_TO_DELIVER;
      image: string;
      details: {
        jobNumber: string;
        driverName: string;
        jobID: Types.ObjectId;
        unableToDeliverReason: string;
      };
    }
  | {
      type: NotificationType.TEST;
      image: string;
      details: {
        name: string;
        jobNumber: string;
      };
    };
