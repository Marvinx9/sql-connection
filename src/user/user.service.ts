import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async findUserById(id: string) {
    const sql = `SELECT * FROM users WHERE id = $1`;
    const result = await this.pool.query(sql, [id]);
    return result.rows[0];
  }

  async createUser(name: string, email: string, password: string) {
    const sql =
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
    const result = await this.pool.query(sql, [name, email, password]);
    return result.rows[0];
  }
}
