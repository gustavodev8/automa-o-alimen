import type { FastifyReply, FastifyRequest } from 'fastify';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.schema.js';
import { OrderService } from '../services/order.service.js';

const orderService = new OrderService();

export async function listOrderBoardController(_request: FastifyRequest, reply: FastifyReply) {
  const orders = await orderService.listBoard();
  return reply.send({ orders });
}

export async function getOrderSummaryController(_request: FastifyRequest, reply: FastifyReply) {
  const summary = await orderService.summary();
  return reply.send({ summary });
}

export async function createOrderController(request: FastifyRequest, reply: FastifyReply) {
  const input = createOrderSchema.parse(request.body);
  const order = await orderService.create(input);
  return reply.status(201).send({ order });
}

export async function updateOrderStatusController(request: FastifyRequest, reply: FastifyReply) {
  const input = updateOrderStatusSchema.parse(request.body);
  const { id } = request.params as { id: string };
  const order = await orderService.updateStatus(id, input);
  return reply.send({ order });
}
