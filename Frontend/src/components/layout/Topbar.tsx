import { useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useUIStore } from '../../store/uiStore';

const BREADCRUMB: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/team': 'Team',
};

export const Topbar = () => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const openRightDrawer = useUIStore((s) => s.openRightDrawer);
  const openMobileNav = useUIStore((s) => s.openMobileNav);

  const current = BREADCRUMB[location.pathname] ?? 'Page';

  return (
    <header className="h-[68px] border-b border-border flex items-center justify-between gap-3 px-4 md:px-7 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={openMobileNav}
          className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-primary hover:bg-primary/5 transition-colors shrink-0"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="text-secondary hidden sm:inline">Leadsrack</span>
          <span className="text-muted hidden sm:inline">/</span>
          <span className="text-primary truncate">{current}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          id="right-drawer-trigger"
          type="button"
          onClick={openRightDrawer}
          className="relative p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary"
          aria-label="Open notifications"
        >
          <Bell size={18} />
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-brand"
          />
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 sm:pl-3 sm:border-l sm:border-border">
            <div className="hidden md:block text-right">
              <p className="text-primary text-xs font-medium leading-tight truncate max-w-[140px]">
                {user.name}
              </p>
              <p className="text-secondary text-[10px] uppercase tracking-wider leading-tight">
                {user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 hover:bg-primary/5 rounded-lg transition-colors text-primary"
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
