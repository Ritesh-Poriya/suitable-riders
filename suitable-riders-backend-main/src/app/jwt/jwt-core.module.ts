import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { IJwtConfiguration } from '../common/@types/configuration/jwt.configuration';
import { JWT_CONFIGURATION } from './jwt.constants';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({})
export class JwtCoreModule {
  static forRootAsync(asyncOptions: {
    inject: any[];
    useFactory: (...args: any[]) => Promise<ConfigService<IJwtConfiguration>>;
  }): DynamicModule {
    const { useFactory } = asyncOptions;
    return {
      module: JwtCoreModule,
      providers: [
        {
          provide: JWT_CONFIGURATION,
          useFactory: useFactory,
          inject: asyncOptions.inject,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
