export interface CreateCategoryDto {
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface UpdateCategoryDto {
  nome?: string;
  descricao?: string | null;
  ativo?: boolean;
}
