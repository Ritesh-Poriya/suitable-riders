import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { EJSModule } from '../ejs/ejs.module';
import { PDFOptions } from './@types/PDFOptions';
import { PDF_EJS_CONSUMER } from './constants';
import { PDFService } from './pdf.service';

@Global()
@Module({})
export class PDFModule {
  static register(options: PDFOptions): DynamicModule {
    return {
      module: PDFModule,
      imports: [
        EJSModule.forFeature({
          consumer: PDF_EJS_CONSUMER,
          templatePath: options.templatePath,
        }),
      ],
      providers: [PDFService, Logger],
      exports: [PDFService],
    };
  }
}
