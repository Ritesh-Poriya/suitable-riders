import { ApiResponseProperty } from '@nestjs/swagger';
import { User } from 'src/app/users/entity/user.entity';

export class GetIncompleteMerchantProfileResDTO {
  @ApiResponseProperty()
  data: User[];
  @ApiResponseProperty()
  merchantCount: number;
}
