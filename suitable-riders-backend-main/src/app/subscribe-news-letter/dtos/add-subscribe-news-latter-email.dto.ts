import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { SubscribeNewsLetter } from '../entity/subscribe-news-letter.entity';

export class AddSubscribeNewsLetterEmailReqDTO extends PickType(
  SubscribeNewsLetter,
  ['email'],
) {}

export class AddSubscribeNewsLetterEmailResDTO extends SubscribeNewsLetter {
  @ApiResponseProperty()
  _id: string;
}
