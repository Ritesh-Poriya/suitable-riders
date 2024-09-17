import { SignupSendOTPRequest } from './@types/redis-signup-object';
import { OTPForActionEnum } from './@types/otp-for-action';
import { SendOtpRequest } from './send-otp-request';
import { Injectable } from '@nestjs/common';
import { UserRole } from '../users/@types/user-role-type';

@Injectable()
export class OTPRequestFactory {
  public otpRequestForSignUp(data: SignupSendOTPRequest): SendOtpRequest {
    return new SendOtpRequest(
      data.email,
      OTPForActionEnum.SIGNUP_REQUEST,
      data,
    );
  }

  public otpRequestToUpdateEmail(
    email: string,
    role: UserRole,
  ): SendOtpRequest {
    return new SendOtpRequest(email, OTPForActionEnum.UPDATE_EMAIL, {
      email: email,
      phoneNo: null,
      role: role,
    });
  }
}
