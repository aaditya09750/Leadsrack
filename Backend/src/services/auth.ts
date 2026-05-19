import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, type UserDoc } from '../models/User.js';
import { conflict, unauthorized } from '../lib/errors.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.js';

function signToken(user: UserDoc): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, options);
}

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: UserDoc; token: string }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw conflict('Email already registered');

  const passwordHash = await User.hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  return { user, token: signToken(user) };
}

export async function loginUser(input: LoginInput): Promise<{ user: UserDoc; token: string }> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw unauthorized('Invalid credentials');

  const ok = await user.comparePassword(input.password);
  if (!ok) throw unauthorized('Invalid credentials');

  return { user, token: signToken(user) };
}

export async function getUserById(id: string): Promise<UserDoc | null> {
  return User.findById(id);
}
