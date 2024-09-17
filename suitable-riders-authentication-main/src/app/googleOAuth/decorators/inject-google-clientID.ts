import { Inject } from '@nestjs/common';
import { GOOGLE_CLIENT_ID } from '../constants';

export const InjectGoogleClientID = () => Inject(GOOGLE_CLIENT_ID);
