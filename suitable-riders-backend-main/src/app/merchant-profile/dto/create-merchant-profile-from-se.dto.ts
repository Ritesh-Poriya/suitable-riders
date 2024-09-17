import { IsJWT } from 'class-validator';
import { CreateMerchantProfileResDTO } from './create-merchant-profile.dto';
/** Create DTO for create merchant from suitable eats project api */
export class CreateMerchantProfileFromSeReqDTO {
  @IsJWT()
  accessToken: string;
}
export class CreateMerchantProfileFromSeResDTO extends CreateMerchantProfileResDTO {}
