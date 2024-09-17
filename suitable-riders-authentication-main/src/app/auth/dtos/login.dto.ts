import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/app/users/entity/user.entity';

export class LogInDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firebaseIdToken: string;
}

export class Credentials {
  @ApiResponseProperty()
  accessToken: string;
  @ApiResponseProperty()
  refreshToken: string;
  @ApiResponseProperty({})
  expiresIn: number;
}

export class LogInResDTO {
  @ApiResponseProperty()
  credentials: Credentials;
  @ApiResponseProperty()
  user: User;
}
