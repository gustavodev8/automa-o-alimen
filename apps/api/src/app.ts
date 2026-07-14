import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { env } from './shared/config/env.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { loggerOptions } from './infrastructure/logger/pino.js';
import { registerApiRoutes } from './interfaces/http/routes/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: loggerOptions,
    bodyLimit: 10 * 1024 * 1024,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((item) => item.trim()),
    credentials: true,
  });

  await app.register(helmet);
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Lanchonete Automation API',
        description: 'API de automação para atendimento de lanchonete via WhatsApp',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
  }));

  await app.register(registerApiRoutes, { prefix: '/api/v1' });

  return app;
}
