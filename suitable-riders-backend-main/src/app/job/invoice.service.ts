import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './entity/job.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: Model<JobDocument>,
    private logger: Logger,
  ) {}
  public async generateInvoiceID(
    driverID: string,
    driverProfileNumber: string,
    jobID: Types.ObjectId,
  ): Promise<any> {
    this.logger.debug('generateInvoiceID()', {
      driverID,
      driverProfileNumber,
      jobID,
    });
    let invoiceID;
    const driverProfile = await this.jobModel
      .findOne({
        driverID: new Types.ObjectId(driverID),
        invoiceID: { $ne: null },
      })
      .sort({ createdAt: -1 });
    if (driverProfile) {
      invoiceID = driverProfile.invoiceID.replace('SR', '');
      invoiceID = parseFloat(invoiceID) + 1;
      const job = await this.jobModel.findByIdAndUpdate(
        jobID,
        {
          $set: { invoiceID: 'SR' + invoiceID },
        },
        { new: true },
      );
      console.log(job);
      return job;
    } else {
      const job = await this.jobModel.findByIdAndUpdate(
        jobID,
        {
          $set: { invoiceID: `SR${driverProfileNumber}000001` },
        },
        { new: true },
      );
      console.log(job);
      return job;
    }
  }

  public async getInvoiceID(jobID) {
    this.logger.debug(`InvoiceService.getInvoiceID() jobID: ${jobID}`);
    const invoice = await this.jobModel.findById(jobID);
    return invoice;
  }
}
