import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { CustomErrorCodes } from 'src/app/common/@types/custom-error-codes';
import { BackGroundType } from 'src/app/common/@types/image-processing-types';
import { CustomHTTPException } from 'src/app/common/errors/custom.exception';

@Injectable()
export class BackgroundValidationPipe implements PipeTransform {
  transform(value: string): BackGroundType {
    if (value.includes('blur-')) {
      value = value.replace('blur-', '');
      try {
        const blur = parseInt(value);
        return {
          blur: blur,
        };
      } catch (error) {
        throw new CustomHTTPException(
          {
            key: 'errors.INVALID_BACKGROUND_BLUR',
          },
          HttpStatus.BAD_REQUEST,
          CustomErrorCodes.INVALID_BACKGROUND_BLUR,
        );
      }
    }
    if (!this.isValidHex(value)) {
      throw new CustomHTTPException(
        {
          key: 'errors.INVALID_BACKGROUND_COLOR',
        },
        HttpStatus.BAD_REQUEST,
        CustomErrorCodes.INVALID_BACKGROUND_COLOR,
      );
    }
    return {
      color: value,
    };
  }

  isValidHex(hex: string) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex);
  }
}
