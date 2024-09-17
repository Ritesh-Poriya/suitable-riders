import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SendOtpRequest } from './send-otp-request';
import { v4 as uuid } from 'uuid';
import { UtilService } from '../common/util.service';
import { RedisService } from '../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { OTPEventEnum } from './@types/otp.events';
import { VerifyOtpRequest } from './@types/verify-otp-request';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { PayloadVerificationType } from './@types/payload-verification-type';
import { WrongOTPError } from '../common/errors/WrongOTP.error';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';

@Injectable()
export class OTPService {
  constructor(
    private utilService: UtilService,
    private logger: Logger,
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    @InjectQueue('otp') private otpQueue: any,
  ) {}

  async sendOTP(request: SendOtpRequest) {
    this.logger.debug(`Sending OTP to ${request.toEmail}`);
    const uid = uuid();
    const otp = this.utilService.getRandomOTP(6);
    const payload = { ...request.payload, otp };
    this.redisService.getClient().set(uid, JSON.stringify(payload));
    this.eventEmitter.emit(OTPEventEnum.SEND_OTP, {
      email: request.toEmail,
      action: request.action,
      otp,
    });
    this.otpQueue.add(
      OTPEventEnum.EXPIRE_OTP,
      { uid },
      {
        delay:
          1000 * 60 * this.configService.get('settings.OTPExpireAfterMins'),
      },
    );
    return { uid };
  }

  async verifyOTP(request: VerifyOtpRequest) {
    this.logger.debug(`Verifying OTP for ${request.uid}`);
    const rawPayload = await this.redisService.getClient().get(request.uid);
    const payload: PayloadVerificationType & { otp: string } =
      JSON.parse(rawPayload);
    if (!payload) {
      this.logger.warn(`No OTP found for ${request.uid}`);
      throw new CustomHTTPException(
        {
          key: 'errors.SESSION_EXPIRED',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.SESSION_EXPIRED,
      );
    } else {
      if (
        payload.role !== request.payload.role ||
        payload.email !== request.payload.email ||
        payload.phoneNo !== request.payload.phoneNo
      ) {
        this.logger.warn(
          `Payload mismatched redis:${JSON.stringify(
            payload,
          )} request:${JSON.stringify(request)}`,
        );
        throw new CustomHTTPException(
          {
            key: 'errors.BAD_REQUEST',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.BAD_REQUEST,
        );
      }
      if (payload.otp !== request.otp) {
        throw new WrongOTPError();
      }
      this.redisService.getClient().del(request.uid);
      return true;
    }
  }
}
