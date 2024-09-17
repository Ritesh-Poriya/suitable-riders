import { ApiResponseProperty } from '@nestjs/swagger';

export class DeclinedJobResDTO {
  @ApiResponseProperty()
  declinedJob: boolean;
}
