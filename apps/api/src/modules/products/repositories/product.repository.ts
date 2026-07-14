import { prisma } from '../../../infrastructure/database/prisma/client.js';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.schema.js';

export class ProductRepository {
  list() {
    return prisma.produto.findMany({
      orderBy: { nome: 'asc' },
      include: {
        categoria: true,
      },
    });
  }

  findById(id: string) {
    return prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });
  }

  create(data: CreateProductInput) {
    return prisma.produto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        categoriaId: data.categoriaId,
        preco: data.preco,
        foto: data.foto ?? null,
        ativo: data.ativo ?? true,
        estoque: data.estoque ?? 0,
        tempoPreparo: data.tempoPreparo ?? 0,
      },
      include: {
        categoria: true,
      },
    });
  }

  update(id: string, data: UpdateProductInput) {
    return prisma.produto.update({
      where: { id },
      data: {
        ...(data.nome ? { nome: data.nome } : {}),
        ...(data.descricao !== undefined ? { descricao: data.descricao } : {}),
        ...(data.categoriaId ? { categoriaId: data.categoriaId } : {}),
        ...(data.preco !== undefined ? { preco: data.preco } : {}),
        ...(data.foto !== undefined ? { foto: data.foto } : {}),
        ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
        ...(data.estoque !== undefined ? { estoque: data.estoque } : {}),
        ...(data.tempoPreparo !== undefined ? { tempoPreparo: data.tempoPreparo } : {}),
      },
      include: {
        categoria: true,
      },
    });
  }

  archive(id: string) {
    return prisma.produto.update({
      where: { id },
      data: { ativo: false },
      include: {
        categoria: true,
      },
    });
  }
}
