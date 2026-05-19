import { Schema, model, type Types } from 'mongoose';

export interface IActivity {
  actor: Types.ObjectId;
  action: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activitySchema.index({ createdAt: -1 });

activitySchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const Activity = model<IActivity>('Activity', activitySchema);
