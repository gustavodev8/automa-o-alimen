import type { FastifyReply, FastifyRequest } from 'fastify';
import { EvolutionService } from '../services/evolution.service.js';

const evolutionService = new EvolutionService();

export async function evolutionConnectionController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const connection = await evolutionService.getConnectionInfo();

  return reply.send(connection);
}
