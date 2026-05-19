import { Schema, model } from 'mongoose';

export interface IDashboardKpi {
  key: string;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  bgKey: string;
  order: number;
}

const kpiSchema = new Schema<IDashboardKpi>(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    value: { type: String, required: true },
    change: { type: String, required: true },
    positive: { type: Boolean, required: true },
    bgKey: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

kpiSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const DashboardKpi = model<IDashboardKpi>('DashboardKpi', kpiSchema);
