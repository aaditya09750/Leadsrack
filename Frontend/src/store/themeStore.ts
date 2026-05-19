import { create } from 'zustand';

const THEME_KEY = 'leadsrack.theme';
type Theme = 'dark' | 'light';

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  bootstrap: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
  bootstrap: () => {
    const theme = readStoredTheme();
    applyTheme(theme);
    set({ theme });
  },
}));
