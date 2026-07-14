export type UserRole = 'ADMIN' | 'ATENDENTE' | 'COZINHA' | 'ENTREGADOR';

export interface UserEntity {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  ultimoLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
