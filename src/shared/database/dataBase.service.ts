/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import * as oracledb from 'oracledb';
import { IDatabase } from './IDatabase';

@Injectable()
export class DatabaseService implements IDatabase {
  public oracle: typeof oracledb & { OBJECT: number };

  private logger = new Logger('DatabaseService');

  constructor() {
    this.oracle = oracledb as typeof oracledb & { OBJECT: number };
    this.oracle.autoCommit = false;
    this.oracle.fetchArraySize = 100;
    this.oracle.fetchAsBuffer = [oracledb.BLOB] as any;
    this.oracle.fetchAsString = [oracledb.CLOB] as any;

    this.createPool();
    oracledb.initOracleClient();
  }

  async createPool() {
    try {
      await this.oracle.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
        poolIncrement: 3,
        poolMax: 25,
        poolMin: 3,
        poolPingInterval: 1,
        poolTimeout: 60,
      });

      this.logger.warn(`Conexão iniciada!`);

      process
        .once('SIGTERM', this.closePoolAndExit)
        .once('SIGINT', this.closePoolAndExit);
    } catch (err) {
      this.logger.error(
        'createPool: Ocorreu um erro ao iniciar a conexão',
        err,
      );
    }
  }

  async open(): Promise<oracledb.Connection> {
    try {
      return await this.oracle.getConnection();
    } catch (err) {
      this.logger.error(`open: ${err.stack}`);
      throw new Error(err);
    }
  }

  async commitAndClose(connection: oracledb.Connection) {
    try {
      if (!connection) {
        this.logger.error('commitAndClose: Conexão não encontrada.');
        return;
      }

      await connection.commit();
      await connection.close();
    } catch (err) {
      this.logger.error(`commitAndClose: ${err.stack}`);
      throw new Error(err);
    }
  }

  async rollbackAndClose(connection: oracledb.Connection) {
    try {
      if (!connection) {
        this.logger.error('rollbackAndClose: Conexão não encontrada.');
        return;
      }

      await connection.rollback();

      await connection.close();
    } catch (err) {
      this.logger.error(`rollbackAndClose: ${err.stack}`);
      throw new Error(err);
    }
  }

  async query<T>(
    sql: string,
    binds: oracledb.BindParameters = {},
    connection?: oracledb.Connection | null,
  ): Promise<T[]> {
    let isOpenTransaction = true;

    const isLogging = process.env.DB_LOGGING as string;

    if (!connection) {
      connection = await this.open();
      isOpenTransaction = false;
    }

    try {
      const options = {
        outFormat: this.oracle.OBJECT,
        maxRows: 1000,
        dir: this.oracle.BIND_IN,
      };

      const result = await connection.execute(sql, binds, options);

      let rows: T[] = [];

      if (result && result.rows && result.rows.length > 0) {
        rows = result.rows.map((one: Record<string, unknown>) => {
          const newValues: Record<string, unknown> = {};

          Object.keys(one).forEach(
            (key: string) => (newValues[key.toLowerCase()] = one[key]),
          );

          return newValues;
        }) as T[];
      }

      if (!isOpenTransaction) this.commitAndClose(connection);
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
    binds: oracledb.BindParameters = {},
    connection: oracledb.Connection | null = null,
  ): Promise<oracledb.Result<T>> {
    let isOpenTransaction = true;

    const isLogging = process.env.DB_LOGGING_SOLUS as string;

    try {
      if (!connection) {
        connection = await this.open();
        isOpenTransaction = false;
      }

      const options = {
        outFormat: this.oracle.OBJECT,
        maxRows: 1000,
        dir: this.oracle.BIND_IN,
      };

      const result = await connection.execute<T>(sql, binds, options);

      if (!isOpenTransaction) this.commitAndClose(connection);
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
      await this.oracle.getPool().close(10);

      this.logger.warn('queryBindOut: Conexão encerrada.');

      process.exit(0);
    } catch (err) {
      if (this.logger) this.logger?.error(err.message);
      process.exit(1);
    }
  }
}
