export type ConversationState =
  | 'INICIO'
  | 'ESCOLHENDO_CATEGORIA'
  | 'ESCOLHENDO_PRODUTO'
  | 'ESCOLHENDO_QUANTIDADE'
  | 'ESCOLHENDO_ADICIONAIS'
  | 'RESUMO'
  | 'AGUARDANDO_ENDERECO'
  | 'AGUARDANDO_LOCALIZACAO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'SAIU_ENTREGA'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface ConversationEntity {
  id: string;
  clienteId: string;
  estado: ConversationState;
  ultimaPergunta: string | null;
  contexto: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
