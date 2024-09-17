import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from './@types/firebase.interface';
import { InjectFirebaseAdmin } from './decorators/firebase.decorator';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class FirebaseAuthService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  public async getUserFromIDToken(idToken: string): Promise<UserRecord> {
    const decodedToken = await this.firebase.auth.verifyIdToken(idToken);
    const user = await this.firebase.auth.getUser(decodedToken.uid);
    return user;
  }

  public async getUserFromPhoneNo(phoneNo: string): Promise<UserRecord> {
    const user = await this.firebase.auth.getUserByPhoneNumber(phoneNo);
    return user;
  }

  public async deleteUserByPhoneNo(phoneNo: string): Promise<void> {
    const user = await this.firebase.auth.getUserByPhoneNumber(phoneNo);
    await this.firebase.auth.deleteUser(user.uid);
  }
}
