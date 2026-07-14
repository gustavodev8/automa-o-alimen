import type { FastifyReply, FastifyRequest } from 'fastify';
import { createCategorySchema, updateCategorySchema } from '../validators/category.schema.js';
import { CategoryService } from '../services/category.service.js';

const categoryService = new CategoryService();

export async function listCategoriesController(_request: FastifyRequest, reply: FastifyReply) {
  const categories = await categoryService.list();
  return reply.send({ categories });
}

export async function createCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const input = createCategorySchema.parse(request.body);
  const category = await categoryService.create(input);
  return reply.status(201).send({ category });
}

export async function updateCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const input = updateCategorySchema.parse(request.body);
  const { id } = request.params as { id: string };
  const category = await categoryService.update(id, input);
  return reply.send({ category });
}

export async function archiveCategoryController(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const category = await categoryService.archive(id);
  return reply.send({ category });
}
