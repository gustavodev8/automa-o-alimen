export interface ProductEntity {
  id: string;
  nome: string;
  descricao: string | null;
  categoriaId: string;
  preco: string;
  foto: string | null;
  ativo: boolean;
  estoque: number;
  tempoPreparo: number;
  createdAt: Date;
  updatedAt: Date;
}
