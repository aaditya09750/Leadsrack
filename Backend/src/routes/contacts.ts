import { Router, type Request, type Response } from 'express';
import type { Types } from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { Contact } from '../models/Contact.js';

interface PopulatedContact {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  avatar?: string;
  linkedUser?: { _id: Types.ObjectId; name: string; email: string; role: string } | null;
}

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const items = (await Contact.find({})
      .populate('linkedUser', 'name email role')
      .sort({ name: 1 })
      .lean()) as unknown as PopulatedContact[];

    res.json({
      data: items.map((c) => ({
        id: String(c._id),
        name: c.name,
        email: c.email ?? c.linkedUser?.email,
        avatar: c.avatar,
        linkedUserRole: c.linkedUser?.role ?? null,
      })),
    });
  }),
);

export { router as contactsRouter };
