import { FastifyInstance } from 'fastify';
import { User } from '../models/user';

export async function configureJWT(server: FastifyInstance) {
  await server.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'examly-super-secret-key',
    cookie: {
      cookieName: 'token',
      signed: false
    }
  });

  server.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
  }
  interface FastifyRequest {
    user: User;
  }
}