import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export const ROLES = ['admin', 'sales'] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

interface UserModel extends Model<IUser, Record<string, never>, IUserMethods> {
  hashPassword(plain: string): Promise<string>;
}

export type UserDoc = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'sales', required: true },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
};

userSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = out._id;
    delete out._id;
    delete out.passwordHash;
    return out;
  },
});

export const User = model<IUser, UserModel>('User', userSchema);
