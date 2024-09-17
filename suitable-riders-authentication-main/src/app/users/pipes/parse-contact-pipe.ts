import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseContactPipe implements PipeTransform {
  transform(value: string): string {
    if (value.includes('@')) {
      console.log('value', value);
      value = value.toLowerCase();
    }
    return value;
  }
}
