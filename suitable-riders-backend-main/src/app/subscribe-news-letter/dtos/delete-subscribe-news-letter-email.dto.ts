import { PickType } from '@nestjs/swagger';
import { SubscribeNewsLetter } from '../entity/subscribe-news-letter.entity';

export class DeleteSubscribeNewsLetterEmailReqDTO extends PickType(
  SubscribeNewsLetter,
  ['email'],
) {}
