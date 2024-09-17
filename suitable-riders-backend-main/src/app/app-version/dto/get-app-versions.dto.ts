import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { CreateAppVersionResDTO } from './create-app-version.dto';

export class GetAppVersionsResDTO {
  appVersions: CreateAppVersionResDTO[];

  @ApiProperty()
  @IsNumber()
  totalCount: number;
}
