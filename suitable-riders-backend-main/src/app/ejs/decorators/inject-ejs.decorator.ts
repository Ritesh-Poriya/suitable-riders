import { Inject } from '@nestjs/common';

export const InjectEJS = (consumer: string) => Inject(consumer);
