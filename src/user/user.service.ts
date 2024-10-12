import { Injectable } from '@nestjs/common';
import { DatabaseServicePg } from 'src/shared/database/postgres/dataBasePg.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseServicePg: DatabaseServicePg) {}

  async findUserById(id: string) {
    const sql = `
    SELECT
      *
    FROM users
    WHERE id = $1
    `;

    const binds = [id];

    const result = await this.databaseServicePg.query(sql, binds);
    return result[0];
  }

  async createUser(name: string, email: string, password: string) {
    const sql = `
      INSERT INTO users (
        name,
        email,
        password
        ) VALUES (
        $1,
        $2,
        $3
        ) 
        `;

    const binds = [name, email, password];

    return await this.databaseServicePg.query(sql, binds);
  }
}
