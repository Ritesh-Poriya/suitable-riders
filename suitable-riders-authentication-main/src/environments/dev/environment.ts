import { IEnvironmentConfigType } from '../IEnvironmentConfigType';

export const environment: IEnvironmentConfigType = {
  production: false,
  allowedOrigins: [
    'http://localhost',
    'https://localhost',
    'https://www.suitableriders.com',
    'https://dev.suitableriders.com',
    'http://dev.suitableriders.com',
  ],
  seUrl: 'https://dev.suitableeats.com/',
  SRLogo: 'https://dev.suitableriders.com/media/images/platform/WebLogo.png',
  SRUrl: 'https://dev.suitableriders.com/',
};
