import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CHECKED_BLOCKED_USER } from '../constants';
/**
 * decorator of check blocked user
 */
export const CheckBlockedUser = () =>
  applyDecorators(SetMetadata(CHECKED_BLOCKED_USER, true));
