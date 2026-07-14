import { z } from 'zod';

export const createCustomerSchema = z.object({
  nome: z.string().min(2).max(150),
  telefone: z.string().min(8).max(30),
  email: z.string().email().nullable().optional(),
  documento: z.string().min(5).max(30).nullable().optional(),
  ativo: z.boolean().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
