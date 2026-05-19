import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { listTeam } from '../services/team.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const overview = await listTeam();
    res.json({ data: overview });
  }),
);

export { router as teamRouter };
