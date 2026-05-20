import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { dashboardOverviewQuerySchema } from '../schemas/dashboard.js';
import { getOverview } from '../services/dashboard.js';
import type { PeriodKey } from '../lib/periods.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/overview',
  validate({ query: dashboardOverviewQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as PeriodKey) ?? 'month';
    const overview = await getOverview(req.user!, period);
    res.json({ data: overview });
  }),
);

export { router as dashboardRouter };
