/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserEntity } from './user.entity';
import { InjectClient } from 'nest-postgres';
import { Client } from 'pg';

@Injectable()
export class UserRepository {
  constructor(@InjectClient() private readonly pg: Client) {}

  async createUser(user: UserEntity): Promise<UserEntity> {
    const query =
      'INSERT INTO "user"(usr_id, usr_username, usr_email, usr_password, usr_first_name, usr_last_name) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [
      user.id,
      user.username,
      user.email,
      user.password,
      user.firstName,
      user.lastName,
    ];

    const result = await this.pg.query<UserEntity>(query, values);
    return result.rows[0];
  }

  async getUsers(): Promise<UserEntity[]> {
    const query = 'SELECT * FROM "user"';

    const result = await this.pg.query<UserEntity>(query);
    return result.rows;
  }

  async updateUser(
    id: string,
    newDataUser: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const userToUpdate = await this.pg.query<UserEntity>(
      'SELECT * FROM "user" WHERE usr_id = $1',
      [id],
    );

    if (userToUpdate.rowCount === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser: UserEntity = { ...userToUpdate.rows[0], ...newDataUser };

    const query =
      'UPDATE "user" SET usr_username = $1, usr_email = $2, usr_password = $3, usr_first_name = $4, usr_last_name = $5 WHERE usr_id = $6 RETURNING *';
    const values = [
      updatedUser.username,
      updatedUser.email,
      updatedUser.password,
      updatedUser.firstName,
      updatedUser.lastName,
      id,
    ];

    const result = await this.pg.query<UserEntity>(query, values);

    return result.rows[0];
  }

  async emailExist(email: string): Promise<boolean> {
    const query = 'SELECT usr_email FROM "user" WHERE usr_email = $1';

    const result = await this.pg.query(query, [email]);
    return result.rowCount > 0;
  }
}
