import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MerchantBalance } from './entity/merchant-balance.entity';
import { MerchantPayable } from './entity/merchant-payable.entity';
import { MerchantPayout } from './entity/merchant-payout.entity';
import { createMerchantPayoutReqDto } from './dto/create-merchant-payout.dto';
import { CustomHTTPException } from '../common/errors/custom.exception';
import { CustomErrorCodes } from '../common/@types/custom-error-codes';
import { Model, Types } from 'mongoose';

@Injectable()
export class MerchantPayoutsService {
  perDeliveryChange: number = 0.25;
  constructor(
    @InjectModel(MerchantBalance.name)
    private merchantBalanceModel: Model<MerchantBalance>,
    @InjectModel(MerchantPayable.name)
    private merchantPayableModel: Model<MerchantPayable>,
    @InjectModel(MerchantPayout.name)
    private merchantPayoutModel: Model<MerchantPayout>,
  ) {}

  async createPayout(dto: createMerchantPayoutReqDto) {
    if (isNaN(dto.amount) || dto.amount < 1) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_AMOUNT',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_AMOUNT,
      );
    }

    await this.merchantPayoutModel.create({ ...dto });
    return this.updateBalance(dto.merchantID, dto.amount);
  }

  async getMerchantBalance(merchantID: string) {
    const ballancePayable = await this.getMerchantBallancePayable(merchantID);
    return { ballancePayable };
  }

  async incrementJobCompleteCount(merchantID: string) {
    const currentDate = new Date();
    const currentMonth = `${String(currentDate.getUTCMonth() + 1).padStart(
      2,
      '0',
    )}-${currentDate.getUTCFullYear()}`;

    let merchantPayable = await this.merchantPayableModel.findOne({
      merchantID: merchantID,
      month: currentMonth,
    });

    let jobCount: { [amount: number]: number } =
      merchantPayable?.jobCount ?? {};

    if (merchantPayable == undefined) {
      jobCount[this.perDeliveryChange.toString()] = 1;
      await this.merchantPayableModel.create({
        merchantID: merchantID,
        month: currentMonth,
        jobCount,
        amount: this.perDeliveryChange,
      });
    } else {
      jobCount[this.perDeliveryChange.toString()] =
        (merchantPayable?.jobCount[this.perDeliveryChange.toString()] ?? 0) + 1;
      await this.merchantPayableModel.updateOne(
        {
          merchantID: merchantID,
          month: currentMonth,
        },
        {
          $set: {
            jobCount,
            amount: merchantPayable.amount + this.perDeliveryChange,
          },
        },
      );
    }

    return this.updateBalance(merchantID, this.perDeliveryChange * -1);
  }

  async updateBalance(merchantID, amount: number) {
    let merchantBalance = await this.merchantBalanceModel.findOne({
      merchantID: merchantID,
    });

    if (merchantBalance == undefined) {
      await this.merchantBalanceModel.create({
        merchantID: merchantID,
        amount: amount,
      });
    } else {
      await this.merchantBalanceModel.updateOne(
        { merchantID: merchantID },
        {
          $set: { amount: merchantBalance.amount + amount },
        },
      );
    }
  }

  async getMerchantBallancePayable(merchantID: string) {
    let merchantBalance = await this.merchantBalanceModel.findOne({
      merchantID: merchantID,
    });

    return merchantBalance == undefined ? 0.0 : merchantBalance.amount * -1;
  }
}
