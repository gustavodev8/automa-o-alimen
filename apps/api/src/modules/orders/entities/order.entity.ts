export type OrderStatus =
  | 'NOVO'
  | 'PAGO'
  | 'PREPARANDO'
  | 'PRONTO'
  | 'SAIU_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export type OrderType = 'ENTREGA' | 'RETIRADA';

export interface OrderEntity {
  id: string;
  codigo: string;
  clienteId: string;
  status: OrderStatus;
  tipo: OrderType;
  total: number;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
