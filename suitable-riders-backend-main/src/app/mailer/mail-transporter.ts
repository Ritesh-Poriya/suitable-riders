import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { TransporterConfig } from './@types/MailerConfig';

export class EmailTransport {
  private transporter: nodemailer.Transporter;

  constructor(config: TransporterConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  async send(data: Mail.Options): Promise<any> {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(data, (error: any, info: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}
