import { forwardRef, Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { JobModule } from '../job/job.module';
import { OTPService } from './otp.services';
/**
 * OTP Module
 */
@Module({
  imports: [forwardRef(() => CommonModule), forwardRef(() => JobModule)],
  providers: [OTPService],
  exports: [OTPService],
})
export class OTPModule {}
