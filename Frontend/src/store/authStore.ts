import { create } from 'zustand';
import type { User } from '../types/api';

const TOKEN_KEY = 'leadsrack.token';

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    set({ token, isHydrated: true });
  },
}));

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
