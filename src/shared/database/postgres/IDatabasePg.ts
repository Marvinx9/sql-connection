import { PoolClient, QueryResult } from 'pg';

export interface IDatabasePg {
  open(): Promise<PoolClient>;

  commitAndClose(client: PoolClient): Promise<void>;

  rollbackAndClose(client: PoolClient): Promise<void>;

  closePoolAndExit(): Promise<void>;

  query<T extends Record<string, unknown>>(
    sql: string,
    binds: any[],
    client: PoolClient | null,
  ): Promise<T[]>;

  queryBindOut<T>(
    sql: string,
    binds: any[],
    client: PoolClient | null,
  ): Promise<QueryResult<T>>;
}
