import ejs from 'ejs';
import path from 'path';

export class MessageBuilder {
  private basePath: string;
  private options: any;

  constructor(templateFolderPath: string, options?: any) {
    this.basePath = templateFolderPath;
    this.options = options;
  }

  public getDataFromTemplate(
    templateName: string,
    locals: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(this.basePath, templateName),
        {
          siteData: {
            site: process.env.SUITABLE_EATS_HOME_SITE,
          },
          ...locals,
        },
        this.options,
        (err: Error | null, str: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(str);
          }
        },
      );
    });
  }
}
