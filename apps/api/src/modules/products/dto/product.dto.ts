export interface CreateProductDto {
  nome: string;
  descricao?: string | null;
  categoriaId: string;
  preco: number;
  foto?: string | null;
  ativo?: boolean;
  estoque?: number;
  tempoPreparo?: number;
}

export interface UpdateProductDto {
  nome?: string;
  descricao?: string | null;
  categoriaId?: string;
  preco?: number;
  foto?: string | null;
  ativo?: boolean;
  estoque?: number;
  tempoPreparo?: number;
}
