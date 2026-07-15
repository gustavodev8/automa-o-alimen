import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';
import { evolutionConnectionController } from '../controllers/evolution-connection.controller.js';
import { evolutionWebhookController } from '../controllers/evolution-webhook.controller.js';

export async function evolutionRoutes(app: FastifyInstance) {
  app.post('/webhook', evolutionWebhookController);
  app.get('/connection', { preHandler: requireAuth }, evolutionConnectionController);
}
