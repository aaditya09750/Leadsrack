import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema,
  leadIdParamsSchema,
} from '../schemas/lead.js';
import * as leadsController from '../controllers/leads.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/export.csv',
  validate({ query: listLeadsQuerySchema }),
  leadsController.exportCsv,
);

router.get('/', validate({ query: listLeadsQuerySchema }), leadsController.list);
router.post(
  '/',
  writeLimiter,
  validate({ body: createLeadSchema }),
  leadsController.create,
);

router.get('/:id', validate({ params: leadIdParamsSchema }), leadsController.getOne);
router.patch(
  '/:id',
  writeLimiter,
  validate({ params: leadIdParamsSchema, body: updateLeadSchema }),
  leadsController.update,
);
router.delete(
  '/:id',
  writeLimiter,
  validate({ params: leadIdParamsSchema }),
  leadsController.remove,
);

export { router as leadsRouter };
