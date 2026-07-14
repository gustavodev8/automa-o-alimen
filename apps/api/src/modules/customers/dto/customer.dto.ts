export interface CreateCustomerDto {
  nome: string;
  telefone: string;
  email?: string | null;
  documento?: string | null;
  ativo?: boolean;
}

export interface UpdateCustomerDto {
  nome?: string;
  telefone?: string;
  email?: string | null;
  documento?: string | null;
  ativo?: boolean;
}
