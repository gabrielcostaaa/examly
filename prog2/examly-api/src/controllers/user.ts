// src/controllers/user.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { UserModel } from '../models/user';
import { CreateUserInput, UpdateUserInput } from '../schemas/user';
import { hashPassword } from '../utils/hash';
import { ZodError } from 'zod';

export class UserController {
  constructor(private userModel: UserModel) {}

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userModel.findAll();
      return reply.send(users);
    } catch (error) {
      request.log.error('Error getting all users:', error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const id = parseInt(request.params.id, 10);
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      return reply.send(user);
    } catch (error) {
      request.log.error(`Error getting user by id ${id}:`, error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async createUser(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    try {
        const { email, password, ...rest } = request.body;

        const existingUser = await this.userModel.findByEmail(email);
        if (existingUser) {
            return reply.status(409).send({ message: 'Email already registered' });
        }

        const password_hash = await hashPassword(password);

        const newUser = await this.userModel.createUser({
            ...rest,
            email,
            password_hash,
        });

        // Omit password hash from the response
        const { passwordHash, ...userResponse } = newUser;

        return reply.status(201).send(userResponse);

    } catch (error) {
        if (error instanceof ZodError) {
            return reply.status(400).send({ message: 'Validation error', errors: error.errors });
        }
        request.log.error('Error creating user:', error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }, Body: UpdateUserInput }>, reply: FastifyReply) {
    const id = parseInt(request.params.id, 10);
    try {
      const updatedUser = await this.userModel.update(id, request.body);
      if (!updatedUser) {
        return reply.status(404).send({ message: 'User not found' });
      }
      return reply.send(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
          return reply.status(400).send({ message: 'Validation error', errors: error.errors });
      }
      request.log.error(`Error updating user ${id}:`, error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const id = parseInt(request.params.id, 10);
    try {
      const success = await this.userModel.remove(id);
      if (!success) {
        return reply.status(404).send({ message: 'User not found' });
      }
      return reply.status(204).send();
    } catch (error) {
      request.log.error(`Error deleting user ${id}:`, error);
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  }
}