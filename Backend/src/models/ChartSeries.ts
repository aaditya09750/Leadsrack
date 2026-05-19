import { Schema, model } from 'mongoose';

export interface IChartSeriesItem {
  name: string;
  data: number[];
  color: string;
  dashed: boolean;
}

export interface IChartSeries {
  chartKey: string;
  xAxis: string[];
  series: IChartSeriesItem[];
}

const chartSeriesItemSchema = new Schema<IChartSeriesItem>(
  {
    name: { type: String, required: true },
    data: { type: [Number], required: true },
    color: { type: String, required: true },
    dashed: { type: Boolean, default: false },
  },
  { _id: false },
);

const chartSeriesSchema = new Schema<IChartSeries>({
  chartKey: { type: String, required: true, unique: true },
  xAxis: { type: [String], required: true },
  series: { type: [chartSeriesItemSchema], required: true },
});

chartSeriesSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const ChartSeries = model<IChartSeries>('ChartSeries', chartSeriesSchema);
