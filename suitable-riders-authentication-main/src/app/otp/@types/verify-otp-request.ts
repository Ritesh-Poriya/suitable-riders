import { PayloadVerificationType } from './payload-verification-type';

export interface VerifyOtpRequest {
  otp: string;
  uid: string;
  payload: PayloadVerificationType;
}
