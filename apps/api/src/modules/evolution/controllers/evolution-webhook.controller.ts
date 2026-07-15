import type { FastifyReply, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../infrastructure/database/prisma/client.js';
import { logger } from '../../../infrastructure/logger/pino.js';
import { AIService } from '../../ai/services/ai.service.js';
import { ConversationService } from '../../conversations/services/conversation.service.js';
import { EvolutionService } from '../services/evolution.service.js';

const conversationService = new ConversationService();
const aiService = new AIService();
const evolutionService = new EvolutionService();

type WebhookPayload = Record<string, unknown>;
type InboundMessageType = 'TEXT' | 'AUDIO' | 'IMAGE' | 'DOCUMENT' | 'LOCATION' | 'STATUS' | 'SYSTEM';

function isRecord(value: unknown): value is WebhookPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value).trim();
  }

  return '';
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value);
    if (text) {
      return text;
    }
  }

  return '';
}

function getNestedValue(value: unknown, path: string[]): unknown {
  let current = value;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function normalizeWhatsAppJid(value: string): string {
  const jid = value.trim();

  if (!jid) {
    return '';
  }

  const base = jid.split('@')[0] ?? jid;
  const digits = base.replace(/\D/g, '');

  return digits || base || jid;
}

function extractMessageText(message: unknown, fallback: unknown[]): string {
  if (!isRecord(message)) {
    return pickString(...fallback);
  }

  return pickString(
    getNestedValue(message, ['conversation']),
    getNestedValue(message, ['extendedTextMessage', 'text']),
    getNestedValue(message, ['imageMessage', 'caption']),
    getNestedValue(message, ['videoMessage', 'caption']),
    getNestedValue(message, ['documentMessage', 'caption']),
    getNestedValue(message, ['buttonsResponseMessage', 'selectedDisplayText']),
    getNestedValue(message, ['buttonsResponseMessage', 'selectedButtonId']),
    getNestedValue(message, ['listResponseMessage', 'title']),
    getNestedValue(message, ['templateButtonReplyMessage', 'selectedDisplayText']),
    getNestedValue(message, ['templateButtonReplyMessage', 'selectedId']),
    ...fallback,
  );
}

function detectMessageType(message: unknown, text: string): InboundMessageType {
  if (!isRecord(message)) {
    return text ? 'TEXT' : 'SYSTEM';
  }

  if (isRecord(message.imageMessage)) {
    return 'IMAGE';
  }

  if (isRecord(message.documentMessage)) {
    return 'DOCUMENT';
  }

  if (isRecord(message.audioMessage)) {
    return 'AUDIO';
  }

  if (isRecord(message.locationMessage)) {
    return 'LOCATION';
  }

  return text ? 'TEXT' : 'SYSTEM';
}

export async function evolutionWebhookController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const body = request.body as unknown;

    if (!isRecord(body)) {
      return reply.send({ ok: true, ignored: true });
    }

    const data = isRecord(body.data) ? body.data : body;
    const key = isRecord(data.key) ? data.key : isRecord(body.key) ? body.key : undefined;
    const message = isRecord(data.message) ? data.message : isRecord(body.message) ? body.message : undefined;
    const event = pickString(body.event, data.event, body.type, data.type);
    const rawFrom = pickString(
      data.remoteJid,
      key?.remoteJid,
      body.from,
      body.number,
      body.sender,
    );
    const sender = normalizeWhatsAppJid(rawFrom);
    const isGroupChat = rawFrom.includes('@g.us');
    const isOutgoing = data.fromMe === true || key?.fromMe === true || body.fromMe === true;
    const messageText = extractMessageText(message, [
      body.text,
      body.body,
      body.caption,
      body.conversation,
      data.text,
    ]);
    const messageType: InboundMessageType = detectMessageType(message, messageText);
    const pushName = pickString(
      data.pushName,
      body.pushName,
      body.name,
      data.notifyName,
      body.notifyName,
    );
    const externalId = pickString(key?.id, data.id, body.id);

    if (!sender || isGroupChat || isOutgoing) {
      return reply.send({
        ok: true,
        ignored: true,
        event: event || undefined,
      });
    }

    const customer = await prisma.cliente.upsert({
      where: { telefone: sender },
      update: {
        nome: pushName || sender,
      },
      create: {
        nome: pushName || sender,
        telefone: sender,
        ativo: true,
      },
    });

    const conversation = await conversationService.upsertByCustomerId(customer.id);

    await prisma.mensagem.create({
      data: {
        conversaId: conversation.id,
        clienteId: customer.id,
        direcao: 'INBOUND',
        tipo: messageType,
        conteudo: messageText,
        externalId: externalId || null,
        rawPayload: body as Prisma.InputJsonValue,
      },
    });

    if (messageType === 'TEXT' && messageText) {
      await answerWithAI({
        conversationId: conversation.id,
        customerId: customer.id,
        customerName: customer.nome,
        customerPhone: customer.telefone,
        messageText,
      });
    }

    return reply.send({ ok: true });
  } catch (error) {
    logger.error(
      {
        error,
        body: request.body,
      },
      'Failed to process Evolution webhook',
    );

    return reply.status(500).send({
      ok: false,
      error: 'EVOLUTION_WEBHOOK_FAILED',
      message: error instanceof Error ? error.message : 'Unexpected webhook failure',
    });
  }
}

async function answerWithAI(input: {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageText: string;
}) {
  if (!aiService.isAutoReplyReady()) {
    logger.info(
      {
        provider: 'ai',
        conversationId: input.conversationId,
      },
      'AI auto reply is not configured; inbound message was stored only',
    );
    return;
  }

  try {
    const [recentMessages, products] = await Promise.all([
      prisma.mensagem.findMany({
        where: {
          conversaId: input.conversationId,
          conteudo: {
            not: null,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.produto.findMany({
        where: {
          ativo: true,
        },
        include: {
          categoria: true,
        },
        orderBy: [{ ordemExibicao: 'asc' }, { nome: 'asc' }],
        take: 50,
      }),
    ]);

    const answer = await aiService.answerCustomerMessage({
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      message: input.messageText,
      history: recentMessages
        .reverse()
        .filter((message) => message.conteudo)
        .map((message) => ({
          role: message.direcao === 'OUTBOUND' ? 'assistant' : 'user',
          content: message.conteudo ?? '',
        })),
      catalog: products.map((product) => ({
        name: product.nome,
        category: product.categoria.nome,
        price: Number(product.preco),
        description: product.descricao,
        stock: product.estoque,
      })),
    });

    if (!answer.trim()) {
      return;
    }

    await evolutionService.sendTextMessage({
      to: input.customerPhone,
      text: answer,
    });

    await prisma.mensagem.create({
      data: {
        conversaId: input.conversationId,
        clienteId: input.customerId,
        direcao: 'OUTBOUND',
        tipo: 'TEXT',
        conteudo: answer,
        rawPayload: {
          source: 'ai-auto-reply',
        } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.warn(
      {
        conversationId: input.conversationId,
        customerPhone: input.customerPhone,
        error,
      },
      'Failed to send AI auto reply',
    );
  }
}
