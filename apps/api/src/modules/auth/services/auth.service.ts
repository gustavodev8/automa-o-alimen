import bcrypt from 'bcryptjs';
import { AppError } from '../../../shared/errors/app-error.js';
import type { Usuario } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository.js';

export interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  role: Usuario['role'];
  ativo: boolean;
}

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async login(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.authRepository.findByEmail(email);

    if (!user || !user.ativo) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.senhaHash);

    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    await this.authRepository.touchLogin(user.id);

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      ativo: user.ativo,
    };
  }
}
