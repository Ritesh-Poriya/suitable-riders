import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSmsTemplateReqDTO } from './dtos/create-sms-template.dto';
import { UpdateSmsTemplateReqDTO } from './dtos/update-sms-template.dto';
import {
  SmsTemplates,
  SmsTemplatesDocument,
} from './entity/sms-templates.entity';

@Injectable()
export class SmsTemplatesService {
  constructor(
    @InjectModel(SmsTemplates.name)
    private smsTemplateModel: Model<SmsTemplatesDocument>,
    private logger: Logger,
  ) {}

  public async createSmsTemplate(dto: CreateSmsTemplateReqDTO) {
    this.logger.debug(
      `smsTemplateService.createSmsTemplate() dto: ${JSON.stringify(dto)}`,
    );
    return await this.smsTemplateModel.create({ ...dto });
  }

  public async updateSmsTemplate(dto: UpdateSmsTemplateReqDTO, id: string) {
    this.logger.debug(
      `smsTemplateService.updateSmsTemplate() dto: ${JSON.stringify(
        dto,
      )} id: ${id}`,
    );
    const smsTemplate = await this.smsTemplateModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: { message: dto.message } },
      { new: true },
    );
    return smsTemplate;
  }

  public async getSmsTemplate() {
    const smsTemplate = await this.smsTemplateModel.find({ isDeleted: false });
    this.logger.debug(`smsTemplateService.getSmsTemplate() ${smsTemplate}`);
    return {
      data: smsTemplate,
    };
  }

  public async deleteSmsTemplate(id: string) {
    this.logger.debug(`smsTemplateService.deleteSmsTemplate() id: ${id}`);
    const smsTemplate = await this.smsTemplateModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: { isDeleted: true } },
      { new: true },
    );
    return { smsTemplate };
  }

  public async getSmsTemplateById(id: string) {
    this.logger.debug(`smsTemplateService.getSmsTemplateById() id: ${id}`);
    return await this.smsTemplateModel.findOne({
      _id: new Types.ObjectId(id),
    });
  }
}
