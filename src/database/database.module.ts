import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async () => {
        const pool = new Pool({
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'marvinx',
          database: 'postgres',
        });

        await pool.query('SELECT 1');

        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
