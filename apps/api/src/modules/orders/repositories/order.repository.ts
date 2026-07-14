import { prisma } from '../../../infrastructure/database/prisma/client.js';
import type { UpdateOrderStatusInput } from '../validators/order.schema.js';

export class OrderRepository {
  listBoard() {
    return prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: true,
        conversa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  findById(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        conversa: true,
        itens: {
          include: {
            produto: true,
          },
        },
        historicoStatus: true,
      },
    });
  }

  create(data: Parameters<typeof prisma.pedido.create>[0]['data']) {
    return prisma.pedido.create({
      data,
      include: {
        cliente: true,
        conversa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  updateStatus(id: string, status: UpdateOrderStatusInput['status']) {
    return prisma.pedido.update({
      where: { id },
      data: { status },
      include: {
        cliente: true,
        conversa: true,
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });
  }

  summary() {
    return prisma.$transaction(async (tx) => {
      const [ordersToday, inProgress, canceled, revenue] = await Promise.all([
        tx.pedido.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        tx.pedido.count({
          where: {
            status: {
              in: ['NOVO', 'PAGO', 'PREPARANDO', 'PRONTO', 'SAIU_ENTREGA'],
            },
          },
        }),
        tx.pedido.count({
          where: {
            status: 'CANCELADO',
          },
        }),
        tx.pedido.aggregate({
          _sum: {
            total: true,
          },
        }),
      ]);

      return {
        ordersToday,
        inProgress,
        canceled,
        revenue: Number(revenue._sum.total ?? 0),
      };
    });
  }

  boardByStatus() {
    return this.listBoard();
  }
}
