import { Schema, model } from 'mongoose';

export const TRAFFIC_KINDS = ['website', 'device', 'location', 'marketing'] as const;
export type TrafficKind = (typeof TRAFFIC_KINDS)[number];

export interface TrafficWebsiteRow {
  name: string;
  value: number;
  active: boolean;
}
export interface TrafficDeviceRow {
  label: string;
  value: number;
  color: string;
}
export interface TrafficLocationRow {
  country: string;
  percentage: number;
  color: string;
}
export interface TrafficMarketingRow {
  month: string;
  value: number;
  color: string;
}
export type TrafficRow =
  | TrafficWebsiteRow
  | TrafficDeviceRow
  | TrafficLocationRow
  | TrafficMarketingRow;

export interface ITrafficAggregate {
  kind: TrafficKind;
  rows: TrafficRow[];
}

const trafficAggregateSchema = new Schema<ITrafficAggregate>({
  kind: { type: String, enum: TRAFFIC_KINDS, required: true, unique: true },
  rows: { type: Schema.Types.Mixed, required: true },
});

trafficAggregateSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const TrafficAggregate = model<ITrafficAggregate>(
  'TrafficAggregate',
  trafficAggregateSchema,
);
