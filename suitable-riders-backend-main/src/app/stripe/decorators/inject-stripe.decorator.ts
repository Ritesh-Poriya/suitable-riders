import { Inject } from '@nestjs/common';
import { STRIPE } from '../constants';

export const InjectStripe = () => Inject(STRIPE);
