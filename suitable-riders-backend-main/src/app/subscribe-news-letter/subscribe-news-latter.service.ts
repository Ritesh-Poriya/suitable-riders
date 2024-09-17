import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../mailer/email.service';
import { AddSubscribeNewsLetterEmailReqDTO } from './dtos/add-subscribe-news-latter-email.dto';
import { DeleteSubscribeNewsLetterEmailReqDTO } from './dtos/delete-subscribe-news-letter-email.dto';
import { SendEmailReqDTO } from './dtos/send-email.dto';
import {
  SubscribeNewsLetter,
  SubscribeNewsLetterDocument,
} from './entity/subscribe-news-letter.entity';

@Injectable()
export class SubscribeNewsLetterService {
  constructor(
    @InjectModel(SubscribeNewsLetter.name)
    private SubscribeNewsLetterModel: Model<SubscribeNewsLetterDocument>,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  public async addSubscribeEmail(dto: AddSubscribeNewsLetterEmailReqDTO) {
    this.logger.debug(
      `SubscribeNewsLetterService.addSubscribeEmail() - dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const isExist = await this.SubscribeNewsLetterModel.findOne({
        email: dto.email,
        isDeleted: false,
      }),
      subscribeNewsLetter = new this.SubscribeNewsLetterModel(dto);
    if (isExist) {
      return isExist;
    }
    return subscribeNewsLetter.save();
  }

  public async deleteSubscribeEmail(dto: DeleteSubscribeNewsLetterEmailReqDTO) {
    this.logger.debug(
      `SubscribeNewsLetterService.deleteSubscribeEmail() - dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const isExist = await this.SubscribeNewsLetterModel.findOneAndUpdate(
      { email: dto.email, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (isExist) {
      return true;
    } else {
      return false;
    }
  }

  public async sendSubscribeEmail(dto: SendEmailReqDTO) {
    this.logger.debug(
      `SubscribeNewsLetterService.sendSubscribeEmail() - dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const users = await this.SubscribeNewsLetterModel.find({
      isDeleted: false,
    });
    for (const user of users) {
      await this.emailService.newsLatterSubscriptionEmail(user.email, {
        content: dto.content,
      });
    }
  }
}
