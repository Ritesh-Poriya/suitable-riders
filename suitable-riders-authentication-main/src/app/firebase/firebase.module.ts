import {
  ClassProvider,
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import {
  FirebaseAdmin,
  FirebaseModuleAsyncOptions,
  FirebaseModuleOptions,
  FirebaseModuleOptionsFactory,
} from './@types/firebase.interface';
import { FIREBASE_MODULE, FIREBASE_TOKEN } from './constants';
import { FirebaseAuthService } from './firebase-auth.service';
import { getFirebaseAdmin } from './util';

@Global()
@Module({})
export class FirebaseModule {
  public static forRoot(options: FirebaseModuleOptions): DynamicModule {
    const provider: Provider<FirebaseAdmin> = {
      provide: FIREBASE_TOKEN,
      useValue: getFirebaseAdmin(options),
    };
    return {
      imports: [CommonModule],
      exports: [provider, FirebaseAuthService],
      module: FirebaseModule,
      providers: [provider, FirebaseAuthService],
    };
  }

  public static forRootAsync(
    options: FirebaseModuleAsyncOptions,
  ): DynamicModule {
    const firebaseProvider: Provider = {
      inject: [FIREBASE_MODULE],
      provide: FIREBASE_TOKEN,
      useFactory: (options: FirebaseModuleOptions) => getFirebaseAdmin(options),
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: FirebaseModule,
      imports: [...(options.imports || [])],
      providers: [...asyncProviders, firebaseProvider, FirebaseAuthService],
      exports: [firebaseProvider, FirebaseAuthService],
    };
  }
  private static createAsyncProviders(
    options: FirebaseModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory || options.useExisting) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
        inject: [options.inject || []],
      } as ClassProvider,
    ];
  }

  private static createAsyncOptionsProvider(
    options: FirebaseModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: FIREBASE_MODULE,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: FIREBASE_MODULE,
      useFactory: async (
        optionsFactory: FirebaseModuleOptionsFactory,
      ): Promise<FirebaseModuleOptions> =>
        await optionsFactory.createFirebaseModuleOptions(),
      inject: options.useClass ? [options.useClass] : [],
    };
  }
}
