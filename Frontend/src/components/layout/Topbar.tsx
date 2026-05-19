import { useLocation } from 'react-router-dom';
import { Bell, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const BREADCRUMB: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
};

export const Topbar = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const current = BREADCRUMB[location.pathname] ?? 'Page';

  return (
    <header className="h-[68px] border-b border-border flex items-center justify-between px-7 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-secondary">Leadsrack</span>
          <span className="text-muted">/</span>
          <span className="text-primary">{current}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-primary text-xs font-medium leading-tight">{user.name}</p>
              <p className="text-secondary text-[10px] uppercase tracking-wider leading-tight">
                {user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
