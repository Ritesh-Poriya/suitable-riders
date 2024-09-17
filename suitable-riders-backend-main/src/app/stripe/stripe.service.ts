import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import qs from 'qs';
import { UnexpectedError } from '../common/errors/unexpected.error';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_ENDPOINT_SECRET } from './constants';
import Stripe from 'stripe';
import {
  DriverProfile,
  DriverProfileDocument,
} from '../driver-profile/entity/driver-profile.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { InjectStripe } from './decorators/inject-stripe.decorator';
import { RawBodyRequest } from './@types/RawBodyRequest';

@Injectable()
export class StripeService {
  constructor(
    @InjectStripe() private stripe: Stripe,
    @Inject(STRIPE_SECRET_KEY) private secret_key: string,
    @Inject(STRIPE_WEBHOOK_ENDPOINT_SECRET) private webhook_secret: string,
    @InjectModel(DriverProfile.name)
    private driverProfileModel: Model<DriverProfileDocument>,
    private logger: Logger,
  ) {}

  async handleStripeCall(method, originalUrl, body, res) {
    const requestObj: any = {
      url: originalUrl.replace('/api/stripe/', 'https://api.stripe.com/v1/'),
      auth: {
        username: this.secret_key,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    requestObj.method = method;
    if (requestObj.method === 'POST') {
      requestObj.data = qs.stringify(body);
    }
    try {
      const stripeRes = await axios(requestObj);
      res.status(stripeRes.status).json(stripeRes.data);
    } catch (error) {
      if (error.response)
        res.status(error.response.status).json(error.response.data);
      else
        throw new UnexpectedError(
          error.message ?? 'Unexpected error while call to stripe',
        );
    }
  }

  async stripeEvent(req: RawBodyRequest<Request>) {
    let driverProfile: DriverProfile, driverSubscription;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        this.webhook_secret,
      );
    } catch (err) {
      throw new UnexpectedError(`Webhook Error: ${err.message}`);
    }

    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as Stripe.Subscription;
      driverProfile = await this.driverProfileModel.findOne({
        stripeID: subscription.customer,
      });
      if (driverProfile == undefined) {
        this.logger.error(
          `Driver Not Found with Customer ID: ${subscription.customer}`,
        );
        return;
      }
      driverSubscription = driverProfile.subscription ?? {};

      driverSubscription.id = subscription.id;
      driverSubscription.status = subscription.status;
      if (event.type.endsWith('.trial_will_end')) {
        driverSubscription.startTime = new Date(
          subscription.trial_start * 1000,
        );
        driverSubscription.endTime = new Date(subscription.trial_end * 1000);
      } else {
        driverSubscription.startTime = new Date(
          subscription.current_period_start * 1000,
        );
        driverSubscription.endTime = new Date(
          subscription.current_period_end * 1000,
        );
      }
    } else if (event.type == 'billing_portal.session.created') {
      return;
    } else {
      this.logger.warn(`Unexpected Stripe Event: ${event.type}`);
      return;
    }

    await this.driverProfileModel.updateOne(
      { ownerID: driverProfile.ownerID },
      { $set: { subscription: driverSubscription } },
    );
  }
}
