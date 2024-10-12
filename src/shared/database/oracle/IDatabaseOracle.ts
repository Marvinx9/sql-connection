import * as oracledb from 'oracledb';

export interface IDatabaseOracle {
  createPool(): Promise<void>;

  open(): Promise<oracledb.Connection>;

  commitAndClose(connection: oracledb.Connection): Promise<void>;

  rollbackAndClose(connection: oracledb.Connection): Promise<void>;

  closePoolAndExit(): Promise<void>;

  query<T>(
    sql: string,
    binds: string[] | number[],
    connection: oracledb.Connection | null,
  ): Promise<T[]>;

  queryBindOut<T>(
    sql: string,
    binds: oracledb.BindParameters,
    connection: oracledb.Connection | null,
  ): Promise<oracledb.Result<T>>;
}
