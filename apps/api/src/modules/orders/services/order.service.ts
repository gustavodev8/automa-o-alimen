import { Prisma } from '@prisma/client';
import { AppError } from '../../../shared/errors/app-error.js';
import { prisma } from '../../../infrastructure/database/prisma/client.js';
import { logger } from '../../../infrastructure/logger/pino.js';
import { EvolutionService } from '../../evolution/services/evolution.service.js';
import { OrderRepository } from '../repositories/order.repository.js';
import type { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.schema.js';

const ORDER_CODE_PREFIX = 'PED';
const evolutionService = new EvolutionService();

type OrderWithRelations = Awaited<ReturnType<OrderRepository['findById']>>;

export class OrderService {
  constructor(private readonly orderRepository = new OrderRepository()) {}

  async create(input: CreateOrderInput) {
    const products = await prisma.produto.findMany({
      where: {
        id: {
          in: input.itens.map((item) => item.produtoId),
        },
        ativo: true,
      },
    });

    if (products.length !== input.itens.length) {
      throw new AppError('Um ou mais produtos não foram encontrados', 404, 'PRODUCT_NOT_FOUND');
    }

    const customer =
      input.clienteId
        ? await prisma.cliente.findUnique({
            where: { id: input.clienteId },
          })
        : input.clienteTelefone
          ? await prisma.cliente.upsert({
              where: { telefone: input.clienteTelefone },
              update: {
                ...(input.clienteNome ? { nome: input.clienteNome } : {}),
              },
              create: {
                nome: input.clienteNome ?? input.clienteTelefone,
                telefone: input.clienteTelefone,
                ativo: true,
              },
            })
          : null;

    if (!customer) {
      throw new AppError('Cliente do pedido é obrigatório', 400, 'CUSTOMER_REQUIRED');
    }

    const coupon =
      input.cupomCodigo && input.cupomCodigo.trim().length > 0
        ? await prisma.cupom.findFirst({
            where: {
              codigo: input.cupomCodigo,
              ativo: true,
            },
          })
        : null;

    const itemRows = input.itens.map((item) => {
      const product = products.find((row) => row.id === item.produtoId);

      if (!product) {
        throw new AppError('Produto inválido no pedido', 400, 'INVALID_ORDER_ITEM');
      }

      const subtotal = Number(product.preco) * item.quantidade;

      return {
        produtoId: product.id,
        quantidade: item.quantidade,
        observacoes: item.observacoes ?? null,
        precoUnitario: new Prisma.Decimal(product.preco),
        subtotal: new Prisma.Decimal(subtotal),
      };
    });

    const rawTotal = itemRows.reduce((total, item) => total + Number(item.subtotal), 0);
    const discount =
      coupon?.tipoDesconto === 'PERCENTUAL'
        ? rawTotal * (Number(coupon.valor) / 100)
        : coupon?.tipoDesconto === 'FIXO'
          ? Number(coupon.valor)
          : 0;
    const total = Math.max(rawTotal - discount, 0);

    const orderCode = `${ORDER_CODE_PREFIX}-${Date.now().toString(36).toUpperCase()}`;

    return prisma.$transaction(async (tx) => {
      const order = await tx.pedido.create({
        data: {
          codigo: orderCode,
          clienteId: customer.id,
          enderecoId: input.enderecoId ?? null,
          status: 'NOVO',
          tipo: input.tipo,
          origem: 'WHATSAPP',
          observacoes: input.observacoes ?? null,
          total: new Prisma.Decimal(total),
          cupomId: coupon?.id ?? null,
          itens: {
            create: itemRows,
          },
          historicoStatus: {
            create: {
              status: 'NOVO',
              observacao: 'Pedido criado',
            },
          },
        },
        include: {
          cliente: true,
          itens: {
            include: {
              produto: true,
            },
          },
          historicoStatus: true,
        },
      });

      return order;
    });
  }

  listBoard() {
    return this.orderRepository.boardByStatus();
  }

  summary() {
    return this.orderRepository.summary();
  }

  async updateStatus(id: string, input: UpdateOrderStatusInput) {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new AppError('Pedido não encontrado', 404, 'ORDER_NOT_FOUND');
    }

    await prisma.$transaction(async (tx) => {
      const updated = await tx.pedido.update({
        where: { id },
        data: { status: input.status },
        include: {
          cliente: true,
          itens: {
            include: {
              produto: true,
            },
          },
          historicoStatus: true,
        },
      });

      await tx.historicoStatus.create({
        data: {
          pedidoId: id,
          status: input.status,
          observacao: `Status alterado para ${input.status}`,
        },
      });

      return updated;
    });

    await this.notifyCustomer(order, input.status);

    return this.orderRepository.findById(id);
  }

  private async notifyCustomer(order: NonNullable<OrderWithRelations>, status: UpdateOrderStatusInput['status']) {
    const text = this.buildStatusMessage(order, status);

    if (!text) {
      return;
    }

    try {
      await evolutionService.sendTextMessage({
        to: order.cliente.telefone,
        text,
      });

      if (order.conversa) {
        await prisma.mensagem.create({
          data: {
            conversaId: order.conversa.id,
            clienteId: order.clienteId,
            direcao: 'OUTBOUND',
            tipo: 'TEXT',
            conteudo: text,
            rawPayload: {
              orderId: order.id,
              status,
              source: 'order-status-notification',
            } as Prisma.InputJsonValue,
          },
        });
      }
    } catch (error) {
      logger.warn(
        {
          orderId: order.id,
          status,
          error,
        },
        'Failed to notify customer about order status change',
      );
    }
  }

  private buildStatusMessage(order: NonNullable<OrderWithRelations>, status: UpdateOrderStatusInput['status']) {
    const politeName = order.cliente.nome.trim() || 'cliente';
    const prefix = `Ola, ${politeName}.`;

    switch (status) {
      case 'PAGO':
        return `${prefix} Recebemos o pagamento do seu pedido ${order.codigo}.`;
      case 'PREPARANDO':
        return `${prefix} Seu pedido ${order.codigo} esta em preparo.`;
      case 'PRONTO':
        return `${prefix} Seu pedido ${order.codigo} esta pronto.`;
      case 'SAIU_ENTREGA':
        return `${prefix} Seu pedido ${order.codigo} saiu para entrega.`;
      case 'ENTREGUE':
        return `${prefix} Seu pedido ${order.codigo} foi entregue. Obrigado!`;
      case 'CANCELADO':
        return `${prefix} Seu pedido ${order.codigo} foi cancelado.`;
      case 'NOVO':
      default:
        return `${prefix} Seu pedido ${order.codigo} foi atualizado.`;
    }
  }
}
