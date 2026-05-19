import { Router } from 'express';
import { authRouter } from './auth.js';
import { healthRouter } from './health.js';
import { leadsRouter } from './leads.js';

const api = Router();

api.use('/health', healthRouter);
api.use('/auth', authRouter);
api.use('/leads', leadsRouter);

export { api };
