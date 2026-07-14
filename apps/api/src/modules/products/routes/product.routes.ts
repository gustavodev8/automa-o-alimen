import type { FastifyInstance } from 'fastify';
import {
  archiveProductController,
  createProductController,
  listProductsController,
  updateProductController,
} from '../controllers/product.controller.js';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';

export async function productRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, listProductsController);
  app.post('/', { preHandler: requireAuth }, createProductController);
  app.patch('/:id', { preHandler: requireAuth }, updateProductController);
  app.delete('/:id', { preHandler: requireAuth }, archiveProductController);
}
