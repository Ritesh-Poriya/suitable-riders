import { DynamicModule, Module } from '@nestjs/common';
import { JwtCoreModule } from './jwt-core.module';
import { IJwtConfiguration } from '../common/@types/configuration/jwt.configuration';
import { ConfigService } from '@nestjs/config';

@Module({})
export class JwtModule {
  static forRootAsync(asyncOptions: {
    inject?: any[];
    useFactory: (...args: any[]) => Promise<ConfigService<IJwtConfiguration>>;
  }): DynamicModule {
    const { useFactory, inject } = asyncOptions;
    return {
      module: JwtModule,
      imports: [JwtCoreModule.forRootAsync({ useFactory, inject })],
    };
  }
}
