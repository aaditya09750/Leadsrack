import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { DashboardKpi } from '../models/DashboardKpi.js';
import { ChartSeries } from '../models/ChartSeries.js';
import { TrafficAggregate, type TrafficKind } from '../models/TrafficAggregate.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/overview',
  asyncHandler(async (_req: Request, res: Response) => {
    const [kpis, chart, trafficAggs] = await Promise.all([
      DashboardKpi.find({}).sort({ order: 1 }).lean(),
      ChartSeries.findOne({ chartKey: 'userChart' }).lean(),
      TrafficAggregate.find({}).lean(),
    ]);

    const rowsByKind = (kind: TrafficKind) =>
      trafficAggs.find((t) => t.kind === kind)?.rows ?? [];

    res.json({
      data: {
        kpis: kpis.map((k) => ({
          key: k.key,
          title: k.title,
          value: k.value,
          change: k.change,
          positive: k.positive,
          bgKey: k.bgKey,
        })),
        userChart: chart
          ? { xAxis: chart.xAxis, series: chart.series }
          : { xAxis: [], series: [] },
        trafficByWebsite: rowsByKind('website'),
        trafficByDevice: rowsByKind('device'),
        trafficByLocation: rowsByKind('location'),
        marketingMonthly: rowsByKind('marketing'),
      },
    });
  }),
);

export { router as dashboardRouter };
