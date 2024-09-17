import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UtilService {
  public capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  public getRelativePath(path: string) {
    const matches = ['/public/', '/private/'];
    const match = matches.find((m) => path.includes(m));
    const splitPath = path.split(match);
    return splitPath[splitPath.length - 1];
  }

  /**
   * create function to convert observable to promise
   */
  public observableToPromise<T>(observable: Observable<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (data) => {
          resolve(data);
          subscription.unsubscribe();
        },
        error: (error) => {
          reject(error);
        },
      });
    });
    throw new Error();
  }

  /**
   * create function to auto generate number or string
   */
  public randomString(length = 10, stringType = 'Aa#') {
    let characters = '';
    if (stringType.includes('A')) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (stringType.includes('a')) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (stringType.includes('#')) characters += '0123456789';

    if (characters === '') return '';

    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  public stringFormat(string) {
    let newString;
    const array = [];
    for (const name of string) {
      newString = name.toLowerCase();
      newString =
        newString.charAt(0).toUpperCase() +
        newString.slice(1).split('_').join(' ');
      array.push(newString);
    }
    return array;
  }

  public getRandomOTP(length: number) {
    const chars = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
      OTP += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return OTP;
  }
  public getPosition(str: string, subStr: string, occurrence: number) {
    return str.split(subStr, occurrence).join(subStr).length;
  }
}
