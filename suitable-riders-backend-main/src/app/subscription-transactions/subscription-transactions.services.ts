import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSubscriptionTransactionReqDTO } from './dto/create-subscription.dto';
import { searchSubscriptionTransactionReqDTO } from './dto/search-subscription.dto';
import { UpdateSubscriptionTransactionReqDTO } from './dto/update-subscription.dto';
import {
  SubscriptionTransactions,
  SubscriptionTransactionsDocument,
} from './entity/subscription-transactions.entity';

/**
 * Subscription services
 */
@Injectable()
export class SubscriptionTransactionsServices {
  constructor(
    @InjectModel(SubscriptionTransactions.name)
    private subscriptionModel: Model<SubscriptionTransactionsDocument>,
    private logger: Logger,
  ) {}

  /**
   *  Function to create subscription
   */
  public async createSubscription(dto: CreateSubscriptionTransactionReqDTO) {
    this.logger.debug(
      `SubscriptionTransactionServices.createSubscription(): ${JSON.stringify(
        dto,
      )}`,
    );
    const existDate = new Date(dto.subscriptionMonth);
    existDate.setDate(existDate.getDate() + 1);
    const newDate = new Date(dto.subscriptionMonth);
    newDate.setDate(newDate.getDate() + 1);
    const subscription = await this.subscriptionModel.create({
      ...dto,
      subscriptionMonth: newDate,
    });
    return subscription;
  }

  /**
   * Function to update subscription
   */
  public async updateSubscription(
    id: string,
    dto: UpdateSubscriptionTransactionReqDTO,
  ) {
    this.logger.debug(
      `SubscriptionTransactionServices.updateSubscription() id: ${id} dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const newDate = new Date(dto.subscriptionMonth);
    newDate.setDate(newDate.getDate() + 1);
    const subscription = await this.subscriptionModel.findByIdAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: false },
      {
        $set: { ...dto, subscriptionMonth: newDate },
      },
      { new: true },
    );
    return subscription;
  }

  /**
   *  Function to get Subscription
   */
  public async getSubscription(id: string) {
    this.logger.debug(
      `SubscriptionTransactionServices.getSubscription() id: ${id}`,
    );
    const subscription = await this.subscriptionModel.findOne({
      _id: new Types.ObjectId(id),
      isDeleted: false,
    });
    return subscription;
  }
  /**
   * Function to search subscription object
   */
  public async searchSubscription(
    dto: searchSubscriptionTransactionReqDTO,
    customSearchQuery: any = null,
  ) {
    this.logger.debug(
      `SubscriptionTransactionServices.searchSubscription() dto: ${JSON.stringify(
        dto,
      )} customSearchQuery: ${JSON.stringify(customSearchQuery)}`,
    );
    let search = {};
    if (dto.searches) {
      if (customSearchQuery) {
        search = customSearchQuery;
      } else {
        search = {
          $or: [
            {
              transactionID: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              amount: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              paymentMode: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              merchantName: {
                $regex: dto.searches,
                $options: 'i',
              },
            },
            {
              'merchant.merchantNumber': {
                $regex: dto.searches,
                $options: 'i',
              },
            },
          ],
        };
      }
    }
    const count = await this.subscriptionModel.count({
      isDeleted: false,
    });
    const filterQuery = {
      ...dto.fields,
      isDeleted: false,
    };
    const subscriptions = await this.subscriptionModel.aggregate([
      {
        $lookup: {
          from: 'merchantprofiles',
          localField: 'merchantProfileID',
          foreignField: '_id',
          as: 'merchant',
        },
      },
      {
        $unwind: {
          path: '$merchant',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unset: [
          'merchant.isDeleted',
          'merchant.isContractAccepted',
          'merchant.createdAt',
          'merchant.updatedAt',
        ],
      },
      {
        $match: filterQuery,
      },
      {
        $match: search,
      },
      { $sort: dto.options.sort || { createdAt: -1 } },
      {
        $skip: dto.options.skip,
      },
      {
        $limit: dto.options.limit,
      },
    ]);
    const filterCount = (
      await this.subscriptionModel.aggregate([
        {
          $lookup: {
            from: 'merchantprofiles',
            localField: 'merchantProfileID',
            foreignField: '_id',
            as: 'merchant',
          },
        },
        {
          $unwind: {
            path: '$merchant',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unset: [
            'merchant.isDeleted',
            'merchant.isContractAccepted',
            'merchant.createdAt',
            'merchant.updatedAt',
          ],
        },
        {
          $match: filterQuery,
        },
        {
          $match: search,
        },
      ])
    ).length;
    return {
      subscriptions: subscriptions,
      filterCount: filterCount,
      totalCount: count,
    };
  }

  /**
   * FUnction to delete subscription
   */
  public async deleteSubscription(id: string) {
    this.logger.debug(
      `SubscriptionTransactionServices.deleteSubscription() id: ${id}`,
    );
    const deleteSubscription = await this.subscriptionModel.findByIdAndUpdate(
      {
        _id: new Types.ObjectId(id),
      },
      {
        $set: { isDeleted: true },
      },
      { new: true },
    );
    return deleteSubscription ? true : false;
  }

  /**
   * Function to get subscription Amount Count
   */
  public async getTotalEarnings() {
    const totalEarnings = await this.subscriptionModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: 0,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    return totalEarnings.length === 0 ? 0 : totalEarnings[0].totalAmount;
  }
}
