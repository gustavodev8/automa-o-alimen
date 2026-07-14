import type { Usuario } from '@prisma/client';
import { prisma } from '../../../infrastructure/database/prisma/client.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  async touchLogin(userId: string): Promise<void> {
    await prisma.usuario.update({
      where: { id: userId },
      data: { ultimoLoginAt: new Date() },
    });
  }
}
