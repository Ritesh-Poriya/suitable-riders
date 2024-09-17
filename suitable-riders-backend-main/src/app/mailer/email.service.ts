import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from '../common/@types/IEnvironmentVariables';
import { EmailTransport } from './mail-transporter';
import { MAILER_EJS_CONSUMER, MAILER_TRANSPORT } from './constants';
import { MessageBuilder } from '../ejs/message-builder';
import { InjectEJS } from '../ejs/decorators/inject-ejs.decorator';
import { environment } from 'src/environments';
import { PDFService } from '../pdf/pdf.service';
import path from 'path';
import { JobDocument } from '../job/entity/job.entity';
import { FilesService } from '../common/files.service';
import { MerchantProfileDocument } from '../merchant-profile/entity/merchant-profile.entity';
import { DriverProfileDocument } from '../driver-profile/entity/driver-profile.entity';
import { VehicleDocument } from '../vehicle/entity/vehicle.entity';
import {
  OrderType,
  PackageType,
  PreferredPaymentMethod,
} from '../job/@types/job-type';
import { VerificationStatus } from '../driver-profile/@types/driver-profile-status-types';
const assetsFolderPath = '../../assets';

@Injectable()
export class EmailService {
  constructor(
    @Inject(MAILER_TRANSPORT) private transporter: EmailTransport,
    @InjectEJS(MAILER_EJS_CONSUMER) private messageBuilder: MessageBuilder,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private logger: Logger,
    private pdfService: PDFService,
    private fileService: FilesService,
  ) {}

  async sendTestMail(
    toMail: string,
    localData: {
      data: {
        action: string;
        otp: string;
      };
    },
  ) {
    this.logger.debug('EmailService.sendTestMail()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'sendOTP.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Test Email',
      localData,
    });
  }

  async jobCompletedToMerchant(
    toMail: string,
    localData: {
      invoiceNumber: string;
      driverName: string;
      driverEmail: string;
      driverPhoneNo: string;
      vehicle: VehicleDocument;
      vehicleName: string;
      todayDate: string;
      jobDate: string;
      pickupTime: string;
      deliveryTime: string;
      SRUrl: string;
      job: JobDocument;
      merchant: MerchantProfileDocument;
      merchantEmail: string;
      merchantPhoneNo: string;
      driverProfile: DriverProfileDocument;
      jobOfferAmount: string;
      packageType: PackageType[];
      orderAmount: string;
      payToMerchantAmount: string;
      forRider: boolean;
    },
  ) {
    this.logger.debug('EmailService.jobCompletedToMerchant()', localData);
    await this.pdfService.generatePDF(
      '/invoice.ejs',
      localData,
      `invoice_${localData.invoiceNumber}`,
    );
    return this.sendMailToWithTemplate(
      {
        toMail,
        template: 'jobCompletedToMerchant.ejs',
        fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
        subject: `Job ${localData.job.jobID} Completed`,
        localData,
        attachment: [
          {
            fileName: `invoice.pdf`,
            path: path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          },
        ],
      },
      {
        onComplete: () => {
          this.fileService.deleteFile(
            path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          );
        },
        onError: () => {
          this.fileService.deleteFile(
            path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          );
        },
      },
    );
  }

  async jobCompletedToDriver(
    toMail: string,
    localData: {
      invoiceNumber: string;
      driverName: string;
      driverEmail: string;
      driverPhoneNo: string;
      vehicle: VehicleDocument;
      vehicleName: string;
      todayDate: string;
      jobDate: string;
      pickupTime: string;
      deliveryTime: string;
      SRUrl: string;
      job: JobDocument;
      merchant: MerchantProfileDocument;
      merchantEmail: string;
      merchantPhoneNo: string;
      driverProfile: DriverProfileDocument;
      jobOfferAmount: string;
      packageType: PackageType[];
      orderAmount: string;
      payToMerchantAmount: string;
      forRider: boolean;
    },
  ) {
    this.logger.debug('EmailService.jobCompletedToDriver()', localData);
    await this.pdfService.generatePDF(
      '/invoice.ejs',
      localData,
      `invoice_${localData.invoiceNumber}`,
    );
    return this.sendMailToWithTemplate(
      {
        toMail,
        template: 'jobCompletedToDriver.ejs',
        fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
        subject: `Job ${localData.job.jobID} Completed`,
        localData,
        attachment: [
          {
            fileName: `invoice.pdf`,
            path: path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          },
        ],
      },
      {
        onComplete: () => {
          this.fileService.deleteFile(
            path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          );
        },
        onError: () => {
          this.fileService.deleteFile(
            path.join(
              __dirname,
              `${assetsFolderPath}/invoice_${localData.invoiceNumber}.pdf`,
            ),
          );
        },
      },
    );
  }

  async jobCancelledByDriverToMerchant(
    toMail: string,
    localData: {
      driverName: string;
      merchantBusinessName: string;
      job: JobDocument;
      dateTime: string;
      files?: string[];
    },
  ) {
    this.logger.debug(
      'EmailService.jobCancelledByDriverToMerchant()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'jobCancelledByDriverToMerchant.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Job ${localData.job.jobID} cancelled by Rider ${localData.driverName}`,
      localData,
      attachment: localData.files.map((file: string) => ({
        fileName: file,
        path: `${environment.SRUrl}${file}`,
      })),
    });
  }

  async jobCancelledByDriverToDriver(
    toMail: string,
    localData: {
      driverName: string;
      job: JobDocument;
      dateTime: string;
      files?: string[];
    },
  ) {
    this.logger.debug('EmailService.jobCancelledByDriverToDriver()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'jobCancelledByDriverToDriver.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Job ${localData.job.jobID} has been cancelled`,
      localData,
      attachment: localData.files.map((file: string) => ({
        fileName: file,
        path: `${environment.SRUrl}${file}`,
      })),
    });
  }

  async jobCancelledByMerchantToDriver(
    toMail: string,
    localData: {
      driverName: string;
      merchantBusinessName: string;
      job: JobDocument;
      dateTime: string;
    },
  ) {
    this.logger.debug(
      'EmailService.jobCancelledByMerchantToDriver()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'jobCancelledByMerchantToDriver.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Job ${localData.job.jobID} has been cancelled by the ${localData.merchantBusinessName}`,
      localData,
    });
  }

  async jobCancelledByMerchantToMerchant(
    toMail: string,
    localData: {
      merchantBusinessName: string;
      job: JobDocument;
      dateTime: string;
    },
  ) {
    this.logger.debug(
      'EmailService.jobCancelledByMerchantToMerchant()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'jobCancelledByMerchantToMerchant.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Job ${localData.job.jobID} Cancelled`,
      localData,
    });
  }

  async monthlySubscriptionReminderToMerchantLastSevenDay(
    toMail: string,
    localData: {
      merchantBusinessName: string;
      month: string;
    },
  ) {
    this.logger.debug(
      'EmailService.monthlySubscriptionReminderToMerchantLastSevenDay()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'monthlySubscriptionReminderLastSevenDays.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Reminder: Your monthly subscription for ${localData.month} is due in 7 days`,
      localData,
    });
  }

  async monthlySubscriptionReminderToMerchantLastDay(
    toMail: string,
    localData: {
      merchantBusinessName: string;
      month: string;
    },
  ) {
    this.logger.debug(
      'EmailService.monthlySubscriptionReminderToMerchantLastDay()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'monthlySubscriptionReminderLastDay.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Reminder: Your monthly subscription for ${localData.month} requires a renewal`,
      localData,
    });
  }

  async subscriptionMissed(
    toMail: string,
    localData: {
      merchantBusinessName: string;
      month: string;
    },
  ) {
    this.logger.debug('EmailService.subscriptionMissed()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'subscriptionMissed.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: `Reminder: Your monthly subscription for ${localData.month} is awaiting renewal`,
      localData,
    });
  }

  async successfullyAppliedForMerchantEnrolment(
    toMail: string,
    localData: {
      merchantName: string;
      merchantNumber: string;
    },
  ) {
    this.logger.debug(
      'EmailService.successfullyAppliedForMerchantEnrolement()',
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: 'successfullyAppliedForMerchantEnrolment.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Merchant enrolment request submitted for review',
      localData,
    });
  }

  async merchantAccountApproved(
    toMail: string,
    localData: {
      merchantName: string;
    },
  ) {
    this.logger.debug('EmailService.merchantAccountApproved()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'merchantAccountApproved.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Merchant enrolment has been approved',
      localData,
    });
  }

  async emailForPOSDispatch(
    toMail: string,
    localData: {
      merchantName: string;
    },
  ) {
    this.logger.debug('EmailService.emailForPOSDispatch()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'emailForPOSDispatch.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Let’s get started with the Suitable Riders POS device',
      localData,
    });
  }

  async verificationProcessFailed(
    toMail: string,
    localData: {
      merchantName: string;
      message: string;
    },
  ) {
    this.logger.debug('EmailService.verificationProcessFailed()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'verificationProcessFailed.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Issues in verifying Merchant enrolment details',
      localData,
    });
  }

  async supportRequest(
    toMail: string,
    localData: {
      name: string;
      email: string;
      role: string;
      title: string;
      description: string;
      files: string[];
    },
  ) {
    this.logger.debug('EmailService.supportRequest()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'supportRequest.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Support Request',
      localData,
      attachment: localData.files.map((file: string) => ({
        fileName: file,
        path: `${environment.SRUrl}${file}`,
      })),
    });
  }

  async supportRequestToUser(
    toMail: string,
    localData: {
      name: string;
      email: string;
      role: string;
      title: string;
      description: string;
      files: string[];
    },
  ) {
    this.logger.debug('EmailService.supportRequestToUser()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'supportRequest.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Support Request',
      localData,
      attachment: localData.files.map((file: string) => ({
        fileName: file,
        path: `${environment.SRUrl}${file}`,
      })),
    });
  }

  async webSupportRequest(
    toMail: string,
    localData: {
      name: string;
      email: string;
      message: string;
    },
  ) {
    this.logger.debug('EmailService.verificationProcessFailed()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'webSupportRequest.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'Support Request',
      localData,
    });
  }

  async newsLatterSubscriptionEmail(
    toMail: string,
    localData: {
      content: string;
    },
  ) {
    this.logger.debug('EmailService.newsLatterSubscriptionEmail()', localData);
    return this.sendMailToWithTemplate({
      toMail,
      template: 'newsLatterSubscriptionEmail.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject: 'News Letter Subscription',
      localData,
    });
  }

  async driverDocVerificationUpdateEmail(
    verificationStatus: VerificationStatus,
    toMail: string,
    localData: {
      driverName: string;
    },
  ) {
    this.logger.debug(
      `EmailService.${
        verificationStatus == VerificationStatus.APPROVED
          ? 'driverDocsApproved'
          : 'driverDocsRejected'
      }()`,
      localData,
    );
    return this.sendMailToWithTemplate({
      toMail,
      template: `${
        verificationStatus == VerificationStatus.APPROVED
          ? 'driverDocsApproved'
          : 'driverDocsRejected'
      }.ejs`,
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      subject:
        verificationStatus == VerificationStatus.APPROVED
          ? 'Your rider profile has been approved'
          : 'Your rider profile has some problems',
      localData: { ...localData, SRUrl: environment.SRUrl },
    });
  }

  async sendDriverRegisteredMail(
    toMail: string,
    localData: {
      username: string;
    },
  ) {
    return this.sendMailToWithTemplate({
      template: 'driver-register.ejs',
      fromMail: '"Suitable Riders"<no-reply@suitableriders.com>',
      toMail: toMail,
      subject: 'Welcome to Suitable Riders',
      localData,
    });
  }

  private async sendMailToWithTemplate(
    attrs: {
      toMail: string;
      fromMail: string;
      subject: string;
      template: string;
      localData: any;
      cc?: string[];
      attachment?: { fileName: string; path: string }[];
    },
    callbacks?: {
      onComplete?: (info: any) => void;
      onError?: (error: any) => void;
    },
  ) {
    this.logger.debug('EmailService.sendMailToWithTemplate()', attrs);
    try {
      const data = await this.messageBuilder.getDataFromTemplate(
        attrs.template,
        {
          ...attrs.localData,
          SRLogo: environment.SRLogo,
          SRUrl: environment.SRUrl,
        },
      );
      const env = environment.production
        ? ''
        : `${this.configService.get('NODE_ENV')}:`;
      const info = await this.transporter.send({
        from: attrs.fromMail,
        to: attrs.toMail,
        subject: `${env}${attrs.subject}`,
        cc: attrs.cc,
        html: data,
        attachments: attrs.attachment,
      });
      if (callbacks && callbacks.onComplete) {
        callbacks.onComplete(info);
      }
    } catch (error) {
      this.logger.error(error);
      if (callbacks && callbacks.onError) {
        callbacks.onError(error);
      }
    }
  }
}
