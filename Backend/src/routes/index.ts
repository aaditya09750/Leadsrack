import { Router } from 'express';
import { authRouter } from './auth.js';
import { healthRouter } from './health.js';

const api = Router();

api.use('/health', healthRouter);
api.use('/auth', authRouter);

export { api };
