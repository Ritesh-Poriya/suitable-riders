import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { UtilService } from '../common/util.service';
import { WrongOTPError } from '../common/errors/WrongOTP.error';
import { JobService } from '../job/job.service';
/**
 * OTP service
 */
@Injectable()
export class OTPService {
  constructor(
    private utilService: UtilService,
    private logger: Logger,
    @Inject(forwardRef(() => JobService))
    private jobService: JobService,
  ) {}

  /**
   * Send OTP
   */
  public async sendOTP(jobID) {
    this.logger.debug(`OtpService.sendOTP() jobID: ${jobID}`);
    const otp = this.utilService.getRandomOTP(2);
    this.jobService.addJobOtp(jobID, otp);
    console.log(otp);
    this.logger.log('OTP', otp);
    return otp;
  }
  /**
   * Verify OTP
   */
  public async verifyOTP(jobID: string, otp: string) {
    this.logger.debug(`OtpService.verifyOTP() jobID: ${jobID}`);
    const rawPayload = await this.jobService.getJobOtp(jobID);
    if (rawPayload !== otp) {
      throw new WrongOTPError();
    }
    return true;
  }
}
