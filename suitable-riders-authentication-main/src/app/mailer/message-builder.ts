import * as ejs from 'ejs';
import * as path from 'path';

export class MessageBuilder {
  private templateFolderPath: string;
  private options: any;

  constructor(templateFolderPath: string) {
    this.options = {};
    this.templateFolderPath = templateFolderPath;
    ejs.localsName;
  }
  public getDataFromTemplate(
    templateName: string,
    locals: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(
        path.join(this.templateFolderPath, templateName),
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
