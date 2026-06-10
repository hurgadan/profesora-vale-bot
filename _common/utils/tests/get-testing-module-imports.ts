import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import config from '../../../config';
import type { AppConfig } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const getTestingModuleImports = (entities?: Function[]) => {
  return [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const opts = configService.get<TypeOrmModuleOptions>('databaseConnectionOptions');
        if (!opts) throw new Error('Database config is missing');

        return {
          ...opts,
          autoLoadEntities: true,
          entities: entities ?? undefined,
        };
      },
    }),
  ];
};
