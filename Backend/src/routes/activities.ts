import { Router, type Request, type Response } from 'express';
import type { Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { Activity } from '../models/Activity.js';

interface PopulatedActivity {
  _id: Types.ObjectId;
  actor: { _id: Types.ObjectId; name: string; email: string; role: string } | null;
  action: string;
  createdAt: Date;
}

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const items = (await Activity.find({})
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()) as unknown as PopulatedActivity[];

    res.json({
      data: items.map((a) => ({
        id: String(a._id),
        actorName: a.actor?.name ?? 'Unknown',
        actorEmail: a.actor?.email ?? '',
        actorRole: a.actor?.role ?? null,
        action: a.action,
        createdAt: a.createdAt,
      })),
    });
  }),
);

export { router as activitiesRouter };
