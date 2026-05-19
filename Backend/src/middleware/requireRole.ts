import type { Request, Response, NextFunction } from 'express';
import { forbidden, unauthorized } from '../lib/errors.js';
import type { Role } from '../models/User.js';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
    return next();
  };
}
