import { OTPForActionEnum } from './@types/otp-for-action';
import { PayloadVerificationType } from './@types/payload-verification-type';

export class SendOtpRequest {
  constructor(
    public toEmail: string,
    public action: OTPForActionEnum,
    public payload: PayloadVerificationType,
  ) {}
}
