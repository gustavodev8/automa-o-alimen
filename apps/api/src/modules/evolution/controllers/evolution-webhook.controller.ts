import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../infrastructure/database/prisma/client.js';
import { ConversationService } from '../../conversations/services/conversation.service.js';

const conversationService = new ConversationService();

export async function evolutionWebhookController(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as Record<string, unknown>;
  const from = String(body.from ?? body.number ?? body.sender ?? '');
  const messageText = String(
    body.text ?? body.message ?? body.body ?? body.caption ?? body.conversation ?? '',
  );

  if (!from) {
    return reply.status(400).send({
      error: 'INVALID_WEBHOOK',
      message: 'Sender phone number is required',
    });
  }

  const customer = await prisma.cliente.upsert({
    where: { telefone: from },
    update: {
      nome: String(body.pushName ?? body.name ?? from),
    },
    create: {
      nome: String(body.pushName ?? body.name ?? from),
      telefone: from,
      ativo: true,
    },
  });

  const conversation = await conversationService.upsertByCustomerId(customer.id);

  await prisma.mensagem.create({
    data: {
      conversaId: conversation.id,
      clienteId: customer.id,
      direcao: 'INBOUND',
      tipo: 'TEXT',
      conteudo: messageText,
      rawPayload: body as Prisma.InputJsonValue,
    },
  });

  return reply.send({ ok: true });
}
