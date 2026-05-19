import React from 'react';
import { 
  LayoutGrid, 
  ShoppingBag, 
  FolderClosed, 
  BookOpen, 
  UserCircle,
  Users,
  FileText,
  MessageSquare,
  Circle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/Avatar';

const navItems = [
  { group: 'Favorites', items: ['Overview', 'Projects'] },
  { 
    group: 'Dashboards', 
    items: [
      { label: 'Default', icon: <LayoutGrid size={18} />, active: true },
      { label: 'eCommerce', icon: <ShoppingBag size={18} /> },
      { label: 'Projects', icon: <FolderClosed size={18} /> },
      { label: 'Online Courses', icon: <BookOpen size={18} /> },
    ] 
  },
  { 
    group: 'Pages', 
    items: [
      { label: 'User Profile', icon: <UserCircle size={18} />, children: ['Overview', 'Projects', 'Campaigns', 'Documents', 'Followers'] },
      { label: 'Account', icon: <Users size={18} /> },
      { label: 'Corporate', icon: <FileText size={18} /> },
      { label: 'Blog', icon: <BookOpen size={18} /> },
      { label: 'Social', icon: <MessageSquare size={18} /> },
    ] 
  }
];

export const Sidebar = () => {
  return (
    <aside className="w-[212px] h-screen bg-sidebar border-r border-border flex flex-col p-5 fixed left-0 top-0 overflow-y-auto hidden lg:flex z-20">
      <div className="flex items-center gap-2 mb-8 px-1">
        <Avatar
          src="/leadsrack-logo.jpg"
          alt="Leadsrack"
          size="md"
        />
        <span className="text-primary text-sm font-medium">Leadsrack</span>
      </div>

      <div className="flex-1 space-y-6">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-secondary text-xs font-medium px-3 uppercase tracking-wider">{group.group}</h3>
            <div className="space-y-1">
              {group.items.map((item: any, i) => {
                const isString = typeof item === 'string';
                const label = isString ? item : item.label;
                const isActive = !isString && item.active;
                
                return (
                  <div key={i} className="relative">
                    {isActive && <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-purple rounded-r-full" />}
                    <button className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive ? "bg-white/10 text-primary" : "text-primary/80 hover:bg-white/5"
                    )}>
                      {!isString && item.icon}
                      {isString && <Circle size={6} className="fill-white/20 text-transparent ml-1 mr-1" />}
                      <span>{label}</span>
                    </button>
                    {!isString && item.children && (
                      <div className="ml-7 mt-1 space-y-1 border-l border-border pl-2">
                        {item.children.map((child: string, ci: number) => (
                          <button key={ci} className="w-full text-left px-3 py-1.5 text-secondary text-xs hover:text-primary transition-colors">
                            {child}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-2 px-3">
          <Avatar src="/leadsrack-logo.jpg" alt="Leadsrack" size="sm" />
          <span className="text-primary text-sm font-semibold">Leadsrack</span>
        </div>
      </div>
    </aside>
  );
};
