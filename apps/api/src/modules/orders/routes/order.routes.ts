import type { FastifyInstance } from 'fastify';
import {
  createOrderController,
  getOrderSummaryController,
  listOrderBoardController,
  updateOrderStatusController,
} from '../controllers/order.controller.js';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';

export async function orderRoutes(app: FastifyInstance) {
  app.get('/board', { preHandler: requireAuth }, listOrderBoardController);
  app.get('/summary', { preHandler: requireAuth }, getOrderSummaryController);
  app.post('/', { preHandler: requireAuth }, createOrderController);
  app.patch('/:id/status', { preHandler: requireAuth }, updateOrderStatusController);
}
