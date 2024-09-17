import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '../@types/user-role-type';

type AllowedRoles = Exclude<UserRole, UserRole.ADMIN>;

const allowedRoles = {
  ...UserRole,
};
delete allowedRoles.ADMIN;
export class IsUserExistDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  contact: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @ApiProperty({ enum: Object.values(allowedRoles) })
  role: AllowedRoles;
}
