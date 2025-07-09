import { FastifyInstance } from 'fastify';

export class DatabaseService {
  constructor(private fastify: FastifyInstance) {}

  async getClient() {
    return await this.fastify.pg.connect();
  }

  async query(queryText: string, values?: any[]) {
    const client = await this.getClient();
    try {
      return await client.query(queryText, values);
    } finally {
      client.release();
    }
  }
}