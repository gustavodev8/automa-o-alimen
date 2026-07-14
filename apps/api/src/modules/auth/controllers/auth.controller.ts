import type { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema } from '../validators/login.schema.js';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

interface JwtSigningServer {
  jwt: {
    sign: (payload: object) => string;
  };
}

interface JwtVerifiedRequest extends FastifyRequest {
  jwtVerify: () => Promise<void>;
  user: {
    sub: string;
    nome: string;
    email: string;
    role: string;
  };
}

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
  const payload = loginSchema.parse(request.body);
  const user = await authService.login(payload.email, payload.password);

  const token = (request.server as unknown as JwtSigningServer).jwt.sign({
    sub: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
  });

  return reply.send({
    token,
    user,
  });
}

export async function meController(request: FastifyRequest, reply: FastifyReply) {
  const authenticatedRequest = request as JwtVerifiedRequest;
  await authenticatedRequest.jwtVerify();
  return reply.send({
    user: authenticatedRequest.user,
  });
}
