// src/routes/user.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserController } from '../controllers/user';
import { UserModel } from '../models/user';
import { createUserSchema, updateUserSchema } from '../schemas/user';
import { User } from '../types/user';

// Função de autorização para restringir o acesso a rotas
export const authorize = (allowedRoles: Array<User['role']>) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // request.user é populado pelo hook de autenticação do JWT
    const user = request.user as User;
    if (!user || !allowedRoles.includes(user.role)) {
      reply.status(403).send({ message: 'Forbidden: You do not have permission to perform this action' });
    }
  };
};

export async function userRoutes(server: FastifyInstance, options: { userModel: UserModel }) {
  const userController = new UserController(options.userModel);

  const adminOnly = { preValidation: [server.authenticate, authorize(['admin'])] };
  const teacherAndAdmin = { preValidation: [server.authenticate, authorize(['admin', 'teacher_coordinator'])] };

  // Rotas para obter usuários
  server.get('/', { ...teacherAndAdmin, handler: userController.getAllUsers.bind(userController) });
  server.get('/:id', { ...teacherAndAdmin, handler: userController.getUserById.bind(userController) });

  // Rota para criar usuário (geralmente admin)
  server.post('/', {
    schema: { body: createUserSchema },
    ...adminOnly,
    handler: userController.createUser.bind(userController)
  });

  // Rota para atualizar usuário
  server.put('/:id', {
    schema: { body: updateUserSchema },
    ...adminOnly,
    handler: userController.updateUser.bind(userController)
  });

  // Rota para deletar usuário
  server.delete('/:id', {
    ...adminOnly,
    handler: userController.deleteUser.bind(userController)
  });
}