import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../../interfaces/http/middlewares/require-auth.js';
import { DashboardService } from '../services/dashboard.service.js';

const dashboardService = new DashboardService();

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/summary', { preHandler: requireAuth }, async (_request, reply) => {
    const summary = await dashboardService.summary();
    return reply.send({ summary });
  });
}
