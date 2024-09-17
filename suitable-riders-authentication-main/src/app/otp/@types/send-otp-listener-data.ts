import { OTPForActionEnum } from './otp-for-action';

export interface SignupSendOTPRequestToListener {
  action: OTPForActionEnum;
  email: string;
  otp: string;
}
