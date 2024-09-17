import path from 'path';
import { IEnvironmentConfigType } from '../IEnvironmentConfigType';

export const environment: IEnvironmentConfigType = {
  production: true,
  allowedOrigins: ['https://www.suitableriders.com'],
  seUrl: 'https://www.suitableeats.com/',
  fileUploadAllowedExtensions: [
    '.jpg',
    '.jpeg',
    '.png',
    '.pdf',
    '.txt',
    '.doc',
    '.docx',
    '.rtf',
    '.bmp',
  ],
  fileMaxSizeInBytes: 24576000, // 24MB
  supportEmail: 'yagnik@weetechsolution.com',
  SRLogo: 'https://www.suitableriders.com/media/images/platform/WebLogo.png',
  SRUrl: 'https://www.suitableriders.com',
  cacheImageFolderPath: path.join(__dirname, '../../../public/images/cache'),
  maxImageSize: 2500,
  minImageQualityLimit: 10,
  standardImageQuality: 60,
  standardImageBlurRatio: 15,
  placeHolderImagePath: path.join(
    __dirname,
    '../../../public/images/platform/placeholder.jpg',
  ),
  allowJobInSearchAfterItBroadcastedInSeconds: 0,
  phoneNumberPattern: /^[s()+-]*([0-9][s()+-]*){12}$/,
};
