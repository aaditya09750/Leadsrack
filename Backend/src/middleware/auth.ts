import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../lib/errors.js';
import type { Role } from '../models/User.js';

interface JWTPayload {
  sub: string;
  role: Role;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return next(unauthorized('Missing or malformed Authorization header'));
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}
