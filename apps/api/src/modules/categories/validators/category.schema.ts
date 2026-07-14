import { z } from 'zod';

export const createCategorySchema = z.object({
  nome: z.string().min(2).max(120),
  descricao: z.string().max(255).nullable().optional(),
  ativo: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
