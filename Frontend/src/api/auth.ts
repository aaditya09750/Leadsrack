import { api } from '../lib/api';
import type { AuthResponse, Role, User } from '../types/api';

interface ApiEnvelope<T> {
  data: T;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/auth/register', input);
  return res.data.data;
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', input);
  return res.data.data;
}

export async function me(): Promise<User> {
  const res = await api.get<ApiEnvelope<{ user: User }>>('/auth/me');
  return res.data.data.user;
}
