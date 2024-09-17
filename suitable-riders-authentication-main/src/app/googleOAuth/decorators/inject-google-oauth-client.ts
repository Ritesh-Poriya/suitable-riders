import { Inject } from '@nestjs/common';
import { GOOGLE_OAUTH_CLIENT } from '../constants';

export const InjectGoogleOauth = () => Inject(GOOGLE_OAUTH_CLIENT);
