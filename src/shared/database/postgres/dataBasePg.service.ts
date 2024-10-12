/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult } from 'pg';
import { IDatabasePg } from './IDatabasePg';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class DatabaseServicePg implements IDatabasePg {
  private pool: Pool;
  private logger = new Logger('DatabaseService');

  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT, 10),
      max: 25,
      min: 3,
      idleTimeoutMillis: 60000,
    });

    this.logger.warn(`Conexão ao PostgreSQL iniciada!`);

    process
      .once('SIGTERM', this.closePoolAndExit)
      .once('SIGINT', this.closePoolAndExit);
  }

  async open(): Promise<PoolClient> {
    try {
      return await this.pool.connect();
    } catch (err) {
      this.logger.error(`open: ${err.stack}`);
      throw new Error(err);
    }
  }

  async commitAndClose(client: PoolClient) {
    try {
      if (!client) {
        this.logger.error('commitAndClose: Conexão não encontrada.');
        return;
      }

      await client.query('COMMIT');
      client.release();
    } catch (err) {
      this.logger.error(`commitAndClose: ${err.stack}`);
      throw new Error(err);
    }
  }

  async rollbackAndClose(client: PoolClient) {
    try {
      if (!client) {
        this.logger.error('rollbackAndClose: Conexão não encontrada.');
        return;
      }

      await client.query('ROLLBACK');
      client.release();
    } catch (err) {
      this.logger.error(`rollbackAndClose: ${err.stack}`);
      throw new Error(err);
    }
  }

  async query<T extends Record<string, unknown>>(
    sql: string,
    binds: Record<string, any> = {},
    client?: PoolClient | null,
  ): Promise<T[]> {
    let isOpenTransaction = true;

    const isLogging = process.env.DB_LOGGING as string;

    if (!client) {
      client = await this.open();
      isOpenTransaction = false;
    }

    try {
      const result: QueryResult<T> = await client.query(
        sql,
        Object.values(binds),
      );

      let rows: T[] = [];

      if (result && result.rows && result.rows.length > 0) {
        rows = result.rows.map((one: Record<string, unknown>) => {
          const newValues: Record<string, unknown> = {};

          Object.keys(one).forEach(
            (key: string) => (newValues[key.toLowerCase()] = one[key]),
          );

          return newValues as T;
        });
      }

      if (!isOpenTransaction) this.commitAndClose(client);
      if (isLogging) this.logger.debug(sql);

      return rows;
    } catch (err) {
      if (isLogging) this.logger.debug(`query: ${sql}`);
      this.logger.error(`query: ${err.stack}`);
      throw new Error(err);
    }
  }

  async queryBindOut<T>(
    sql: string,
    binds: any[] = [],
    client: PoolClient | null = null,
  ): Promise<QueryResult<T>> {
    let isOpenTransaction = true;

    const isLogging = process.env.DB_LOGGING_SOLUS as string;

    try {
      if (!client) {
        client = await this.open();
        isOpenTransaction = false;
      }

      const result: QueryResult<T> = await client.query(sql, binds);

      if (!isOpenTransaction) this.commitAndClose(client);
      if (isLogging) this.logger.debug(sql);

      return result;
    } catch (err) {
      if (isLogging) this.logger.debug(`queryBindOut: ${sql}`);
      this.logger.error(`queryBindOut: ${err.stack}`);
      throw new Error(err);
    }
  }

  async closePoolAndExit() {
    try {
      await this.pool.end();

      this.logger.warn('Conexão com PostgreSQL encerrada.');

      process.exit(0);
    } catch (err) {
      this.logger.error(err.message);
      process.exit(1);
    }
  }
}
