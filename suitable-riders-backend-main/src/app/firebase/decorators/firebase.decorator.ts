import { Inject } from '@nestjs/common';
import { FIREBASE_TOKEN } from '../constants';

export const InjectFirebaseAdmin = () => Inject(FIREBASE_TOKEN);
