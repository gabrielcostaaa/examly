import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth';
import { UserModel } from '../models/user';
import { registerSchema, loginSchema } from '../schemas/auth';

export async function authRoutes(server: FastifyInstance) {
  const authController = new AuthController(server, new UserModel(server.log));

  server.post('/register', {
    schema: {
      body: registerSchema
    },
    handler: authController.register.bind(authController)
  });

  server.post('/login', {
    schema: {
      body: loginSchema
    },
    handler: authController.login.bind(authController)
  });

  server.get('/profile', {
    preValidation: [server.authenticate],
    handler: authController.profile.bind(authController)
  });
}