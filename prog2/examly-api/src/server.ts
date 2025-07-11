// src/server.ts
import Fastify from 'fastify';
import dotenv from 'dotenv';
import fastifyPostgres from '@fastify/postgres';
import { DatabaseService } from './services/database';
import { UserModel } from './models/user';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/user';
import { configureJWT } from './utils/jwt';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Registrar o plugin PostgreSQL
server.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
  // Ou configuração detalhada:
  // host: process.env.DB_HOST,
  // port: parseInt(process.env.DB_PORT || '5432', 10),
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
});

// Inicialização dos serviços
const initializeServices = async () => {
  // Cria o serviço de banco de dados
  const databaseService = new DatabaseService(server);
  
  // Cria os modelos com as dependências injetadas
  const userModel = new UserModel(server.log, databaseService);

  server.register(userRoutes, {
    prefix: '/api/users',
    userModel, // Injetando o modelo
  });

  // Registra as rotas com as dependências necessárias
  server.register(authRoutes, { 
    prefix: '/api/auth',
    // Injetamos as dependências que as rotas precisam
    userModel
  });
};

// Rota básica de saúde da API
server.get('/', async () => {
  return { 
    status: 'online',
    message: 'Bem-vindo à API Examly!',
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    // 1. Garanta que a autenticação JWT seja configurada PRIMEIRO
    await configureJWT(server);

    // 2. Agora pode inicializar os serviços com segurança
    await initializeServices();

    // Inicia o servidor
    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({
      port: port,
      host: '0.0.0.0',
      listenTextResolver: (address) => {
        return `Servidor Examly rodando em ${address}`;
      },
    });
  } catch (err) {
    // Mantenha o console.error para ver erros detalhados, se necessário
    console.error('--- DETALHES COMPLETOS DO ERRO ---'); 
    console.error(err);
    server.log.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

start();