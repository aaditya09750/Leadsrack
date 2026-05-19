import { Schema, model } from 'mongoose';

export const NOTIFICATION_AUDIENCES = ['admin', 'sales', 'all'] as const;
export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];

export interface INotification {
  kind: string;
  message: string;
  audience: NotificationAudience;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    kind: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, enum: NOTIFICATION_AUDIENCES, required: true, default: 'all' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ audience: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    return out;
  },
});

export const Notification = model<INotification>('Notification', notificationSchema);
