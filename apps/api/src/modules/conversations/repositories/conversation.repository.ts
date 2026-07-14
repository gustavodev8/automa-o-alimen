import { prisma } from '../../../infrastructure/database/prisma/client.js';
import type { ConversationState } from '../entities/conversation.entity.js';

export class ConversationRepository {
  async findByCustomerId(customerId: string) {
    return prisma.conversa.findFirst({
      where: { clienteId: customerId },
    });
  }

  async upsertByCustomerId(customerId: string) {
    const existing = await this.findByCustomerId(customerId);

    if (existing) {
      return existing;
    }

    return prisma.conversa.create({
      data: {
        clienteId: customerId,
        estado: 'INICIO',
        contexto: {},
      },
    });
  }

  async updateState(
    conversationId: string,
    estado: ConversationState,
    ultimaPergunta?: string | null,
  ) {
    return prisma.conversa.update({
      where: { id: conversationId },
      data: {
        estado,
        ...(ultimaPergunta !== undefined ? { ultimaPergunta } : {}),
      },
    });
  }
}
