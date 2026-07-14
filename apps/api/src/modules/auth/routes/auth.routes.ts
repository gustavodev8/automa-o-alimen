import type { FastifyInstance } from 'fastify';
import { loginController, meController } from '../controllers/auth.controller.js';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', loginController);
  app.get('/me', { preHandler: requireAuth }, meController);
}
