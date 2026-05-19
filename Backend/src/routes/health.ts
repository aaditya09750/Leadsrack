import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ok' : 'degraded',
    service: 'leadsrack-api',
    uptime: process.uptime(),
    db: dbReady ? 'connected' : 'disconnected',
  });
});

export { router as healthRouter };
