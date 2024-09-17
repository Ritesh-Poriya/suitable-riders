import { PickType } from '@nestjs/mapped-types';
import {
  ApiResponseProperty,
  PickType as PickTypeSwagger,
} from '@nestjs/swagger';
import { AppVersion } from '../entity/app-version.entity';

export class CreateAppVersionReqDTO extends PickType(AppVersion, [
  'appType',
  'os',
  'publishedDate',
  'supportedApiVersionNo',
  'versionNo',
]) {}

export class CreateAppVersionReqSwaggerDTO extends PickTypeSwagger(AppVersion, [
  'appType',
  'os',
  'publishedDate',
  'supportedApiVersionNo',
  'versionNo',
]) {}

export class CreateAppVersionResDTO extends AppVersion {
  @ApiResponseProperty()
  _id: string;
}
