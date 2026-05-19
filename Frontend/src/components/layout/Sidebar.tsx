import { useEffect, type ReactNode } from 'react';
import { LayoutGrid, UserCog, Users, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

interface NavEntry {
  label: string;
  to: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const NAV: NavEntry[] = [
  { label: 'Dashboard', to: '/', icon: <LayoutGrid size={18} /> },
  { label: 'Leads', to: '/leads', icon: <Users size={18} /> },
  { label: 'Team', to: '/team', icon: <UserCog size={18} />, adminOnly: true },
];

interface SidebarBodyProps {
  visibleNav: NavEntry[];
  onNavigate?: () => void;
}

const SidebarBody = ({ visibleNav, onNavigate }: SidebarBodyProps) => (
  <>
    <div className="flex items-center gap-2 mb-8 px-1">
      <Avatar src="/leadsrack-logo.jpg" alt="Leadsrack" size="md" />
      <span className="font-display text-primary text-sm font-medium">Leadsrack</span>
    </div>

    <div className="flex-1 space-y-2">
      <h3 className="text-secondary text-xs font-medium px-3 uppercase tracking-wider">
        Workspace
      </h3>
      <div className="space-y-1">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-primary/80 hover:bg-primary/5',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-purple rounded-r-full" />
                ) : null}
                {item.icon}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>

    <div className="mt-auto pt-6 border-t border-border">
      <div className="flex items-center gap-2 px-3">
        <Avatar src="/leadsrack-logo.jpg" alt="Leadsrack" size="sm" />
        <span className="font-display text-primary text-sm font-semibold">Leadsrack</span>
      </div>
    </div>
  </>
);

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin');

  const isOpen = useUIStore((s) => s.mobileNavOpen);
  const close = useUIStore((s) => s.closeMobileNav);
  const location = useLocation();

  // Close on route change.
  useEffect(() => {
    if (isOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Body-scroll-lock + Escape-to-close, mirroring RightDrawer pattern.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Desktop sidebar — visible at lg+ */}
      <aside className="w-[212px] h-screen bg-sidebar border-r border-border flex-col p-5 fixed left-0 top-0 overflow-y-auto hidden lg:flex z-20">
        <SidebarBody visibleNav={visibleNav} />
      </aside>

      {/* Mobile sidebar drawer — toggled via uiStore.mobileNavOpen, hidden at lg+ */}
      <AnimatePresence>
        {isOpen ? (
          <div className="lg:hidden">
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              aria-hidden="true"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.aside
              key="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar border-r border-border z-50 flex flex-col p-5 shadow-2xl"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
              <SidebarBody visibleNav={visibleNav} onNavigate={close} />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
