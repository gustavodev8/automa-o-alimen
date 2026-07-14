export interface CategoryEntity {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
