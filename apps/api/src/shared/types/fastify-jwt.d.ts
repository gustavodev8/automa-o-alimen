import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      nome: string;
      email: string;
      role: string;
    };
    user: {
      sub: string;
      nome: string;
      email: string;
      role: string;
    };
  }
}
