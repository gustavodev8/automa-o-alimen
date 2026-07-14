export interface CustomerEntity {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  documento: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
