import type { FastifyError, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from './app-error.js';

export function errorHandler(
  error: FastifyError | Error,
  _request: unknown,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      details: error.details ?? null,
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: error.flatten(),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return reply.status(400).send({
      error: 'DATABASE_ERROR',
      message: 'Database request failed',
      details: { code: error.code, meta: error.meta },
    });
  }

  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error',
  });
}
