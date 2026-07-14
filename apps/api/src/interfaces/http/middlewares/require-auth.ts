import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await (request as FastifyRequest & { jwtVerify: () => Promise<void> }).jwtVerify();
  } catch {
    return reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Authentication is required',
    });
  }
}
