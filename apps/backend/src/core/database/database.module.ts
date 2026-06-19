import {
  Module,
  Global,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initDb, closeDb } from '../../db';

export const DATABASE_TOKEN = 'DATABASE_CONNECTION';
export const LEGACY_DB_CLIENT_TOKEN = 'DB_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return initDb({
          host: config.get<string>('DB_HOST') || 'localhost',
          port: config.get<number>('DB_PORT') || 5432,
          user: config.get<string>('DB_USER') || 'postgres',
          password: config.get<string>('DB_PASSWORD') || 'postgres',
          database: config.get<string>('DB_NAME') || 'pos2026',
        });
      },
    },
    {
      provide: LEGACY_DB_CLIENT_TOKEN,
      inject: [DATABASE_TOKEN],
      useFactory: (db: unknown) => db,
    },
  ],
  exports: [DATABASE_TOKEN, LEGACY_DB_CLIENT_TOKEN],
})
export class DatabaseModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  onApplicationBootstrap() {
    // Already initialized by factory
  }

  async onApplicationShutdown() {
    await closeDb();
  }
}
