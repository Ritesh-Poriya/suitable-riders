export interface IEnvironmentConfigType {
  production: boolean;
  allowedOrigins: string[];
  seUrl: string;
  fileUploadAllowedExtensions: string[];
  fileMaxSizeInBytes: number;
  SRLogo: string;
  SRUrl: string;
  supportEmail: string;
  cacheImageFolderPath: string;
  maxImageSize: number;
  minImageQualityLimit: number;
  standardImageQuality: number;
  standardImageBlurRatio: number;
  placeHolderImagePath: string;
  allowJobInSearchAfterItBroadcastedInSeconds: number;
  phoneNumberPattern: RegExp;
}
