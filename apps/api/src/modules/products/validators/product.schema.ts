import { z } from 'zod';

export const createProductSchema = z.object({
  nome: z.string().min(2).max(150),
  descricao: z.string().max(500).nullable().optional(),
  categoriaId: z.string().cuid(),
  preco: z.number().positive(),
  foto: z.string().url().nullable().optional(),
  ativo: z.boolean().optional(),
  estoque: z.number().int().nonnegative().optional(),
  tempoPreparo: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
