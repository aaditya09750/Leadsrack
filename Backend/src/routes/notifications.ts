import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { unauthorized } from '../lib/errors.js';
import { Notification } from '../models/Notification.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw unauthorized();

    const filter =
      req.user.role === 'admin' ? {} : { audience: { $in: ['sales', 'all'] } };

    const items = await Notification.find(filter).sort({ createdAt: -1 }).lean();

    res.json({
      data: items.map((n) => ({
        id: String(n._id),
        kind: n.kind,
        message: n.message,
        audience: n.audience,
        createdAt: n.createdAt,
      })),
    });
  }),
);

export { router as notificationsRouter };
