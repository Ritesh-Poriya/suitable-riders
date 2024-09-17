import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UtilService {
  public getRandomOTP(length: number) {
    const chars = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
      OTP += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return OTP;
  }

  public capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
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
}
