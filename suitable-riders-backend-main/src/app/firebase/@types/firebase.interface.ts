import type { Type } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common';
import firebaseAdmin from 'firebase-admin';
import { AppOptions } from 'firebase-admin';

export type FirebaseModuleOptions = {
  googleApplicationCredential?: string | firebaseAdmin.ServiceAccount;
} & Omit<AppOptions, 'credential'>;

export interface FirebaseModuleOptionsFactory {
  createFirebaseModuleOptions():
    | Promise<FirebaseModuleOptions>
    | FirebaseModuleOptions;
}

export type FirebaseModuleAsyncOptions = {
  useClass?: Type<FirebaseModuleAsyncOptions>;
  useFactory: (
    ...args: any[]
  ) => Promise<FirebaseModuleOptions> | FirebaseModuleOptions;
  inject?: any[];
  useExisting?: Type<FirebaseModuleOptionsFactory>;
} & Pick<ModuleMetadata, 'imports'>;

export interface FirebaseAdmin {
  auth: firebaseAdmin.auth.Auth;
  messaging: firebaseAdmin.messaging.Messaging;
  db: firebaseAdmin.firestore.Firestore;
  storage: firebaseAdmin.storage.Storage;
}
