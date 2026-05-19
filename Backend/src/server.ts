import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

async function start(): Promise<void> {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'server started');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => {
      logger.warn('forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

start().catch((err) => {
  logger.fatal({ err }, 'startup failed');
  process.exit(1);
});
