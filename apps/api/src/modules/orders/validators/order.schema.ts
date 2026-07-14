import { z } from 'zod';

export const orderItemSchema = z.object({
  produtoId: z.string().cuid(),
  quantidade: z.number().int().positive(),
  observacoes: z.string().max(255).nullable().optional(),
});

export const createOrderSchema = z.object({
  clienteId: z.string().cuid().optional(),
  clienteNome: z.string().min(2).max(150).optional(),
  clienteTelefone: z.string().min(8).max(30).optional(),
  tipo: z.enum(['ENTREGA', 'RETIRADA']),
  enderecoId: z.string().cuid().nullable().optional(),
  observacoes: z.string().max(500).nullable().optional(),
  cupomCodigo: z.string().max(30).nullable().optional(),
  itens: z.array(orderItemSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'NOVO',
    'PAGO',
    'PREPARANDO',
    'PRONTO',
    'SAIU_ENTREGA',
    'ENTREGUE',
    'CANCELADO',
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
