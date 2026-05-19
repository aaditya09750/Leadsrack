import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../lib/logger.js';

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => logger.info('mongodb connected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'mongodb error'));
  mongoose.connection.on('disconnected', () => logger.warn('mongodb disconnected'));

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
