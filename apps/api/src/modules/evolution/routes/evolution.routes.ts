import type { FastifyInstance } from 'fastify';
import { evolutionWebhookController } from '../controllers/evolution-webhook.controller.js';

export async function evolutionRoutes(app: FastifyInstance) {
  app.post('/webhook', evolutionWebhookController);
}
