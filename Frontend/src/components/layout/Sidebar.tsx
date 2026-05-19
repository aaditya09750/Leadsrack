import { LayoutGrid, UserCog, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

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

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <aside className="w-[212px] h-screen bg-sidebar border-r border-border flex-col p-5 fixed left-0 top-0 overflow-y-auto hidden lg:flex z-20">
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
    </aside>
  );
};
