// src/server.ts
import Fastify from 'fastify';
import dotenv from 'dotenv';
import fastifyPostgres from '@fastify/postgres';

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

// Rota de teste inicial
server.get('/', async (request, reply) => {
  return { message: 'Bem-vindo à API Examly!' };
});

// Rota de exemplo com PostgreSQL
server.get('/ely-user', async (request, reply) => {
  try {
    const client = await server.pg.connect();
    try {
      const { rows } = await client.query('SELECT * FROM "user" LIMIT 10');
      return rows;
    } finally {
      client.release();
    }
  } catch (err) {
    server.log.error('Erro detalhado:', {
      error: err,
      message: err.message,
      stack: err.stack
    });
    
    reply.status(500).send({ 
      error: 'Erro ao buscar usuários',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      hint: 'Verifique os logs do servidor para mais detalhes'
    });
  }
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port: port, host: '0.0.0.0' }); // Escuta em todas as interfaces de rede
    // O logger já exibe a porta, não precisa de server.log.info adicional aqui
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();