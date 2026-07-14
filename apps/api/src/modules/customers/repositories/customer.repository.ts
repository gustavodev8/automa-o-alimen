import { prisma } from '../../../infrastructure/database/prisma/client.js';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer.schema.js';

export class CustomerRepository {
  list() {
    return prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      include: {
        enderecos: true,
      },
    });
  }

  findById(id: string) {
    return prisma.cliente.findUnique({
      where: { id },
      include: {
        enderecos: true,
      },
    });
  }

  create(data: CreateCustomerInput) {
    return prisma.cliente.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        email: data.email ?? null,
        documento: data.documento ?? null,
        ativo: data.ativo ?? true,
      },
      include: {
        enderecos: true,
      },
    });
  }

  update(id: string, data: UpdateCustomerInput) {
    return prisma.cliente.update({
      where: { id },
      data: {
        ...(data.nome ? { nome: data.nome } : {}),
        ...(data.telefone ? { telefone: data.telefone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.documento !== undefined ? { documento: data.documento } : {}),
        ...(data.ativo !== undefined ? { ativo: data.ativo } : {}),
      },
      include: {
        enderecos: true,
      },
    });
  }

  archive(id: string) {
    return prisma.cliente.update({
      where: { id },
      data: { ativo: false },
      include: {
        enderecos: true,
      },
    });
  }
}
