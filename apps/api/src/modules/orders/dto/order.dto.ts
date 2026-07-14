export interface OrderItemInput {
  produtoId: string;
  quantidade: number;
  observacoes?: string | null;
}

export interface CreateOrderDto {
  clienteId?: string;
  clienteNome?: string;
  clienteTelefone?: string;
  tipo: 'ENTREGA' | 'RETIRADA';
  enderecoId?: string | null;
  observacoes?: string | null;
  cupomCodigo?: string | null;
  itens: OrderItemInput[];
}

export interface UpdateOrderStatusDto {
  status:
    | 'NOVO'
    | 'PAGO'
    | 'PREPARANDO'
    | 'PRONTO'
    | 'SAIU_ENTREGA'
    | 'ENTREGUE'
    | 'CANCELADO';
}
