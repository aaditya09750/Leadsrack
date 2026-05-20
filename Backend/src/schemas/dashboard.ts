import { z } from 'zod';
import { PERIOD_KEYS } from '../lib/periods.js';

export const dashboardOverviewQuerySchema = z.object({
  period: z.enum(PERIOD_KEYS).optional().default('month'),
});

export type DashboardOverviewQuery = z.infer<typeof dashboardOverviewQuerySchema>;
