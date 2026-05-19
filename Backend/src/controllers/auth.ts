import type { Request, Response } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { unauthorized } from '../lib/errors.js';
import * as authService from '../services/auth.js';
import type { RegisterInput, LoginInput } from '../schemas/auth.js';

export const register = asyncHandler(
  async (req: Request<unknown, unknown, RegisterInput>, res: Response) => {
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ data: { user: user.toJSON(), token } });
  },
);

export const login = asyncHandler(
  async (req: Request<unknown, unknown, LoginInput>, res: Response) => {
    const { user, token } = await authService.loginUser(req.body);
    res.status(200).json({ data: { user: user.toJSON(), token } });
  },
);

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized();
  const user = await authService.getUserById(req.user.id);
  if (!user) throw unauthorized();
  res.json({ data: { user: user.toJSON() } });
});
