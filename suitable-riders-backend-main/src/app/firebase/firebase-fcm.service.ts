import { FirebaseAdmin } from './@types/firebase.interface';
import { InjectFirebaseAdmin } from './decorators/firebase.decorator';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

export class FirebaseFCMService {
  constructor(@InjectFirebaseAdmin() private firebase: FirebaseAdmin) {}

  public async sendNotification(message: MulticastMessage) {
    const res = await this.firebase.messaging.sendMulticast(message);
    return res;
  }
}
