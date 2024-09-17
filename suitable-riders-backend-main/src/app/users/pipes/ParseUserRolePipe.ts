import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { CustomHTTPException } from '../../common/errors/custom.exception';
import { UserRole } from '../@types/user-role-type';

@Injectable()
export class ParseUserRolePipe implements PipeTransform {
  transform(value: string): string {
    if (
      !Object.values(UserRole)
        .map((value: string) => value.toLowerCase())
        .includes(value)
    ) {
      throw new CustomHTTPException(
        { key: 'errors.URL_NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.URL_NOT_FOUND,
      );
    }
    if (value.toLowerCase() === UserRole.ADMIN.toLowerCase()) {
      throw new CustomHTTPException(
        { key: 'errors.URL_NOT_FOUND' },
        HttpStatus.NOT_FOUND,
        CustomErrorCodes.URL_NOT_FOUND,
      );
    }
    return Object.values(UserRole).find((role) => role.toLowerCase() === value);
  }
}
