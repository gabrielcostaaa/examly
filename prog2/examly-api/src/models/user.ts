import { FastifyBaseLogger } from 'fastify';
import { DatabaseService } from '../services/database';
import { User } from '../types/user';

export class UserModel {
  constructor(
    private logger: FastifyBaseLogger,
    private db: DatabaseService
  ) {}

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const query = `
      INSERT INTO "user" (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    
    try {
      const { rows } = await this.db.query<User>(query, [
        user.email, 
        user.password_hash, 
        user.name, 
        user.role
      ]);
      return rows[0];
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM "user" WHERE email = $1';
    const { rows } = await this.db.query<User>(query, [email]);
    return rows[0] || null;
  }
}