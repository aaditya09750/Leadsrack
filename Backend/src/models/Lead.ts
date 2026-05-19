import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = ['Website', 'Instagram', 'Referral'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface ILead {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadDoc = HydratedDocument<ILead>;
type LeadModel = Model<ILead>;

const leadSchema = new Schema<ILead, LeadModel>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New',
      required: true,
      index: true,
    },
    source: { type: String, enum: LEAD_SOURCES, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true },
);

leadSchema.index({ createdBy: 1, createdAt: -1 });
leadSchema.index({ name: 'text', email: 'text' });

leadSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const Lead = model<ILead, LeadModel>('Lead', leadSchema);
