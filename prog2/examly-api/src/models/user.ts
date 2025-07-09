// src/models/user.ts
import { FastifyBaseLogger } from 'fastify';
import { DatabaseService } from '../services/database';
import { CreateUserInput, UpdateUserInput } from '../schemas/user';
import { User } from '../types/user';

export class UserModel {
  constructor(
    private logger: FastifyBaseLogger,
    private db: DatabaseService
  ) {}

  async createUser(user: CreateUserInput): Promise<User> {
    const { first_name, last_name, email, password_hash, role } = user;
    const query = `
      INSERT INTO app_user (usr_first_name, usr_last_name, usr_email, usr_password_hash, usr_role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        usr_id as id,
        usr_student_id as "studentId",
        usr_first_name as "firstName",
        usr_last_name as "lastName",
        usr_email as email,
        usr_role as role,
        usr_created_at as "createdAt",
        usr_updated_at as "updatedAt";
    `;
    
    try {
      const { rows } = await this.db.query<User>(query, [
        first_name,
        last_name,
        email,
        password_hash,
        role,
      ]);
      return rows[0];
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
        SELECT
            usr_id as id,
            usr_student_id as "studentId",
            usr_first_name as "firstName",
            usr_last_name as "lastName",
            usr_email as email,
            usr_password_hash as "passwordHash",
            usr_role as role,
            usr_created_at as "createdAt",
            usr_updated_at as "updatedAt"
        FROM app_user 
        WHERE usr_email = $1 AND usr_deleted_at IS NULL`;
    const { rows } = await this.db.query<User>(query, [email]);
    return rows[0] || null;
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT
        usr_id as id,
        usr_student_id as "studentId",
        usr_first_name as "firstName",
        usr_last_name as "lastName",
        usr_email as email,
        usr_role as role,
        usr_created_at as "createdAt",
        usr_updated_at as "updatedAt"
      FROM app_user
      WHERE usr_deleted_at IS NULL
      ORDER BY usr_first_name, usr_last_name;
    `;
    const { rows } = await this.db.query<User>(query);
    return rows;
  }

  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT
        usr_id as id,
        usr_student_id as "studentId",
        usr_first_name as "firstName",
        usr_last_name as "lastName",
        usr_email as email,
        usr_role as role,
        usr_created_at as "createdAt",
        usr_updated_at as "updatedAt"
      FROM app_user
      WHERE usr_id = $1 AND usr_deleted_at IS NULL;
    `;
    const { rows } = await this.db.query<User>(query, [id]);
    return rows[0] || null;
  }

  async update(id: number, user: UpdateUserInput): Promise<User | null> {
    const { first_name, last_name, role } = user;
    const query = `
      UPDATE app_user
      SET
        usr_first_name = COALESCE($1, usr_first_name),
        usr_last_name = COALESCE($2, usr_last_name),
        usr_role = COALESCE($3, usr_role),
        usr_updated_at = NOW()
      WHERE usr_id = $4 AND usr_deleted_at IS NULL
      RETURNING
        usr_id as id,
        usr_student_id as "studentId",
        usr_first_name as "firstName",
        usr_last_name as "lastName",
        usr_email as email,
        usr_role as role,
        usr_created_at as "createdAt",
        usr_updated_at as "updatedAt";
    `;
    const { rows } = await this.db.query<User>(query, [
      first_name,
      last_name,
      role,
      id,
    ]);
    return rows[0] || null;
  }

  async remove(id: number): Promise<boolean> {
    const query = `
      UPDATE app_user
      SET usr_deleted_at = NOW()
      WHERE usr_id = $1 AND usr_deleted_at IS NULL;
    `;
    const { rowCount } = await this.db.query(query, [id]);
    return rowCount > 0;
  }
}