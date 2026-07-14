import { buildApp } from './app.js';
import { env } from './shared/config/env.js';
import { prisma } from './infrastructure/database/prisma/client.js';

async function bootstrap() {
  const app = await buildApp();

  try {
    await prisma.$connect();
    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
  } catch (error) {
    app.log.error(error, 'Failed to start API server');
    process.exit(1);
  }
}

void bootstrap();
