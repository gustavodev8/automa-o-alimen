import type { FastifyInstance } from 'fastify';
import {
  archiveCustomerController,
  createCustomerController,
  listCustomersController,
  updateCustomerController,
} from '../controllers/customer.controller.js';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';

export async function customerRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, listCustomersController);
  app.post('/', { preHandler: requireAuth }, createCustomerController);
  app.patch('/:id', { preHandler: requireAuth }, updateCustomerController);
  app.delete('/:id', { preHandler: requireAuth }, archiveCustomerController);
}
