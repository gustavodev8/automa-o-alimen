import pino from 'pino';
import { env } from '../../shared/config/env.js';

const transport =
  env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          singleLine: false,
        },
      }
    : undefined;

export const loggerOptions = {
  level: env.LOG_LEVEL,
  base: { service: 'api', env: env.NODE_ENV },
  ...(transport ? { transport } : {}),
};

export const logger = pino(loggerOptions);
