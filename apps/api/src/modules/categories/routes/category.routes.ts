import type { FastifyInstance } from 'fastify';
import {
  archiveCategoryController,
  createCategoryController,
  listCategoriesController,
  updateCategoryController,
} from '../controllers/category.controller.js';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, listCategoriesController);
  app.post('/', { preHandler: requireAuth }, createCategoryController);
  app.patch('/:id', { preHandler: requireAuth }, updateCategoryController);
  app.delete('/:id', { preHandler: requireAuth }, archiveCategoryController);
}
