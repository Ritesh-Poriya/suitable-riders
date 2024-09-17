import { IsString, IsNotEmpty } from 'class-validator';

export class IsUserExistDto {
  @IsString()
  @IsNotEmpty()
  contact: string;
}
