import { prisma } from '../../../infrastructure/database/prisma/client.js';
import { OrderService } from '../../orders/services/order.service.js';

export class DashboardService {
  constructor(private readonly orderService = new OrderService()) {}

  async summary() {
    const [orderSummary, products, customers, couriers, activeCategories] = await Promise.all([
      this.orderService.summary(),
      prisma.produto.count({ where: { ativo: true } }),
      prisma.cliente.count({ where: { ativo: true } }),
      prisma.entregador.count({ where: { ativo: true } }),
      prisma.categoria.count({ where: { ativo: true } }),
    ]);

    return {
      ...orderSummary,
      products,
      customers,
      couriers,
      activeCategories,
    };
  }
}
