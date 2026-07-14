import { prisma } from '../../../infrastructure/database/prisma/client.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.schema.js';

export class CategoryRepository {
  list() {
    return prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  findById(id: string) {
    return prisma.categoria.findUnique({
      where: { id },
    });
  }

  create(data: CreateCategoryInput) {
    return prisma.categoria.create({
      data: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        ativo: data.ativo ?? true,
      },
    });
  }

  update(id: string, data: UpdateCategoryInput) {
    return prisma.categoria.update({
      where: { id },
      data: {
        ...(data.nome ? { nome: data.nome } : {}),
        ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
        ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
      },
    });
  }

  archive(id: string) {
    return prisma.categoria.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
