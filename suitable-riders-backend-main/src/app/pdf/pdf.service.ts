import { Injectable, Logger } from '@nestjs/common';
import { InjectEJS } from '../ejs/decorators/inject-ejs.decorator';
import { MessageBuilder } from '../ejs/message-builder';
import { PDF_EJS_CONSUMER } from './constants';
import puppeteer from 'puppeteer';
import path from 'path';

const assetsFolderPath = '../../assets';

@Injectable()
export class PDFService {
  constructor(
    @InjectEJS(PDF_EJS_CONSUMER) private messageBuilder: MessageBuilder,
    private logger: Logger,
  ) {}

  public async generatePDF(
    templateName: string,
    locals: any,
    savedFileName: string,
  ) {
    this.logger.debug(
      `PDFService.generatePDF() templateName: ${templateName} locals: ${JSON.stringify(
        locals,
      )} savedFileName: ${savedFileName}`,
    );
    const html = await this.messageBuilder.getDataFromTemplate(
      templateName,
      locals,
    );
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfPath = path.join(
      __dirname,
      `${assetsFolderPath}/${savedFileName}.pdf`,
    );
    const pdf = await page.pdf({
      format: 'a4',
      path: pdfPath,
      printBackground: true,
    });
    await browser.close();
    return pdf;
  }
}
