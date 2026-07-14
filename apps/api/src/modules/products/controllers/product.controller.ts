import type { FastifyReply, FastifyRequest } from 'fastify';
import { createProductSchema, updateProductSchema } from '../validators/product.schema.js';
import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export async function listProductsController(_request: FastifyRequest, reply: FastifyReply) {
  const products = await productService.list();
  return reply.send({ products });
}

export async function createProductController(request: FastifyRequest, reply: FastifyReply) {
  const input = createProductSchema.parse(request.body);
  const product = await productService.create(input);
  return reply.status(201).send({ product });
}

export async function updateProductController(request: FastifyRequest, reply: FastifyReply) {
  const input = updateProductSchema.parse(request.body);
  const { id } = request.params as { id: string };
  const product = await productService.update(id, input);
  return reply.send({ product });
}

export async function archiveProductController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const product = await productService.archive(id);
  return reply.send({ product });
}
