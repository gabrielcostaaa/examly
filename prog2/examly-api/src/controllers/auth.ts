import { FastifyInstance, FastifyRequest } from 'fastify';
import { UserModel } from '../models/user';
import { RegisterInput, LoginInput } from '../schemas/auth';
import { hashPassword, verifyPassword } from '../utils/hash';

export class AuthController {
  constructor(
    private server: FastifyInstance,
    private userModel: UserModel
  ) {}

  async register(request: FastifyRequest<{ Body: RegisterInput }>) {
    const { email, password, name, role } = request.body;
    
    const client = await this.server.pg.connect();
    try {
      // Verificar se usuário já existe
      const existingUser = await this.userModel.findByEmail(client, email);
      if (existingUser) {
        throw this.server.httpErrors.conflict('Email already registered');
      }

      // Hash da senha
      const password_hash = hashPassword(password);

      // Criar usuário
      const user = await this.userModel.createUser(client, {
        email,
        password_hash,
        name,
        role
      });

      // Gerar token JWT
      const token = this.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return { token, user };
    } finally {
      client.release();
    }
  }

  async login(request: FastifyRequest<{ Body: LoginInput }>) {
    const { email, password } = request.body;
    
    const client = await this.server.pg.connect();
    try {
      const user = await this.userModel.findByEmail(client, email);
      if (!user) {
        throw this.server.httpErrors.unauthorized('Invalid credentials');
      }

      const passwordMatch = verifyPassword(password, user.password_hash);
      if (!passwordMatch) {
        throw this.server.httpErrors.unauthorized('Invalid credentials');
      }

      const token = this.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return { token, user };
    } finally {
      client.release();
    }
  }

  async profile(request: FastifyRequest) {
    return { user: request.user };
  }
}