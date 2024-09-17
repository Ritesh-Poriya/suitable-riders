import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { User } from '../entity/user.entity';

export class UpdateEmailDto extends PickType(User, ['email'] as const) {}

export class UpdateEmailResDTO {
  @ApiResponseProperty()
  uid: string;
}
