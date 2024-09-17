import { Injectable } from '@nestjs/common';
import { DriverProfileService } from '../driver-profile/driver-profile.service';
import { JobService } from '../job/job.service';
import { SubscriptionTransactionsServices } from '../subscription-transactions/subscription-transactions.services';
import { UsersService } from '../users/users.service';
import { UserPayload } from '../jwt/@types/user-payload.interface';
import { FilterJobReqDTO } from './dto/dashboard.dto';
import { JobApprovalStatus } from '../job/@types/job-type';
import { MerchantPayoutsService } from '../merchant-payouts/merchant-payouts.service';

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private jobService: JobService,
    private merchantPayoutsService: MerchantPayoutsService,
    private subscriptionTransactionsServices: SubscriptionTransactionsServices,
    private driverProfileService: DriverProfileService,
  ) {}

  /**
   * Function to build dashboard API
   */
  public async getDashBoardDetails() {
    const merchantCount = await this.usersService.getMerchantCount();
    const riderCount = await this.driverProfileService.getDriverProfileCount();
    const jobFees = await this.jobService.getJobFees();
    const jobCountForLast30days = await this.jobService.getJobCountPerDay(
      false,
      { jobStatus: JobApprovalStatus.DELIVERED },
    );
    const totalJobCount = await this.jobService.getTotalJobCOunt();
    const totalSpend =
      await this.subscriptionTransactionsServices.getTotalEarnings();
    return {
      totalMerchantCount: merchantCount,
      totalRiderCount: riderCount,
      totalJobCount: totalJobCount,
      jobFees: jobFees,
      totalSpend: totalSpend,
      jobCountForLast30days: jobCountForLast30days,
    };
  }

  /**
   * Function to build dashboard API For Merchant
   */
  public async getDashboardDetailsForMerchant(
    user: UserPayload,
    dto: FilterJobReqDTO,
  ) {
    const totalJobsCount = await this.jobService.getJobCountForMerchant(
      user.userID,
      dto.fields,
    );
    const jobSpendingCountForLast30days =
      await this.jobService.getJobCountPerDay(true, {
        ...dto.fields,
        jobStatus: JobApprovalStatus.DELIVERED,
      });
    const ballancePayable =
      await this.merchantPayoutsService.getMerchantBallancePayable(user.userID);
    return {
      ballancePayable: ballancePayable,
      totalJobsCount,
      jobSpendingCountForLast30days,
    };
  }
}
