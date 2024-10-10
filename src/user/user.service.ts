import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/shared/database/Database.service';

@Injectable()
export class UserService {
  constructor(private readonly dataBaseService: DatabaseService) {}

  async findUserById(id: string) {
    const sql = `
    SELECT
      *
    FROM users
    WHERE id = :id
    `;

    const binds = { id };

    const result = await this.dataBaseService.query(sql, binds);
    return result[0];
  }

  async createUser(name: string, email: string, password: string) {
    const sql = `
      INSERT INTO users (
        name,
        email,
        password
        ) VALUES (
        :name,
        :email,
        :password
        ) 
        `;

    const binds = {
      name,
      email,
      password,
    };

    return await this.dataBaseService.query(sql, binds);
  }
}
