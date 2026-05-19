import { Schema, model, type Types } from 'mongoose';

export interface IContact {
  name: string;
  email?: string;
  avatar?: string;
  linkedUser?: Types.ObjectId;
}

const contactSchema = new Schema<IContact>({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  avatar: { type: String },
  linkedUser: { type: Schema.Types.ObjectId, ref: 'User' },
});

contactSchema.index({ name: 1 });
contactSchema.index({ linkedUser: 1 });

contactSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const Contact = model<IContact>('Contact', contactSchema);
