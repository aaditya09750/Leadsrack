import axios, { AxiosError } from 'axios';
import { env } from './env';
import { getStoredToken, useAuthStore } from '../store/authStore';
import type { ApiErrorResponse } from '../types/api';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorResponse>) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.error?.message ?? err.message ?? 'Request failed';
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}
