import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProtectionType } from '../@types/protection-type';

export class UploadFileDto {
  @IsNotEmpty()
  @IsEnum(ProtectionType)
  protection: ProtectionType;
}
