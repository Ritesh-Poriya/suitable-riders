import { DynamicModule, Global, Module } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { GoogleOauthOption } from './@types/google-oauth-options';
import { GOOGLE_CLIENT_ID, GOOGLE_OAUTH_CLIENT } from './constants';

// info: This module is not included in Project.
@Global()
@Module({})
export class GoogleOAuthModule {
  public static forRoot(options: GoogleOauthOption): DynamicModule {
    const client = new OAuth2Client(options.audience);
    return {
      module: GoogleOAuthModule,
      providers: [
        {
          provide: GOOGLE_OAUTH_CLIENT,
          useValue: client,
        },
        {
          provide: GOOGLE_CLIENT_ID,
          useValue: options.audience,
        },
      ],
      exports: [],
    };
  }
}
