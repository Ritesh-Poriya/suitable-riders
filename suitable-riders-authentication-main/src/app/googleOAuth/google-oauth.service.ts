import { Injectable } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { InjectGoogleClientID } from './decorators/inject-google-clientID';

// This service is not used in Project.
@Injectable()
export class GoogleOAuthService {
  constructor(
    @InjectGoogleClientID() private client: OAuth2Client,
    @InjectGoogleClientID() private audience: string,
  ) {}

  public async getPayload(idToken: string): Promise<TokenPayload | undefined> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.audience,
    });
    return ticket.getPayload();
  }
}
