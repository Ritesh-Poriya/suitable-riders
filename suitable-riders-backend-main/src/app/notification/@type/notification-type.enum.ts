/**
 * Set enums for notification type
 */

export enum NotificationType {
  DOC_VERIFICATION_STATUS_UPDATED = 'DOC_VERIFICATION_STATUS_UPDATED',
  NEW_JOB_AVAILABLE = 'NEW_JOB_AVAILABLE',
  JOB_CANCELLED_BY_DRIVER = 'JOB_CANCELLED_BY_DRIVER',
  FOOD_IS_READY = 'FOOD_IS_READY',
  JOB_CANCELLED_BY_MERCHANT = 'JOB_CANCELLED_BY_MERCHANT',
  JOB_ACCEPTED = 'JOB_ACCEPTED',
  RIDER_HAS_ARRIVED = 'RIDER_HAS_ARRIVED',
  ORDER_PICKED_UP_BY_MERCHANT = 'ORDER_PICKED_UP_BY_MERCHANT',
  ORDER_PICKED_UP_BY_DRIVER = 'ORDER_PICKED_UP_BY_DRIVER',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  JOB_UNABLE_TO_DELIVER = 'JOB_UNABLE_TO_DELIVER',
  TEST = 'TEST',
}
export enum NotificationNotes {
  JOB_ACCEPTED_BY_DRIVER = 'This job is already accepted by other driver.',
  JOB_EXPIRED = 'This job has been expired.',
  JOB_CANCELLED_BY_MERCHANT = 'This job has been cancelled by merchant.',
  JOB_DECLINED_BY_DRIVER = 'This job has been declined by driver.',
  JOb_REMOVED = 'This job has been removed.',
}
