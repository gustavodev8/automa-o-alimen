import type { FastifyReply, FastifyRequest } from 'fastify';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.schema.js';
import { CustomerService } from '../services/customer.service.js';

const customerService = new CustomerService();

export async function listCustomersController(_request: FastifyRequest, reply: FastifyReply) {
  const customers = await customerService.list();
  return reply.send({ customers });
}

export async function createCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const input = createCustomerSchema.parse(request.body);
  const customer = await customerService.create(input);
  return reply.status(201).send({ customer });
}

export async function updateCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const input = updateCustomerSchema.parse(request.body);
  const { id } = request.params as { id: string };
  const customer = await customerService.update(id, input);
  return reply.send({ customer });
}

export async function archiveCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const customer = await customerService.archive(id);
  return reply.send({ customer });
}
