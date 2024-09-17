import { IsJWT } from 'class-validator';

export class CreateAdminDTO {
  @IsJWT()
  accessToken: string;
}
