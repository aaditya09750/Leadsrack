import React from 'react';
import { 
  Sidebar as SidebarIcon, 
  Star, 
  Search, 
  Sun, 
  Clock, 
  Bell, 
  Layout 
} from 'lucide-react';

export const Topbar = () => {
  return (
    <header className="h-[68px] border-b border-border flex items-center justify-between px-7 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <SidebarIcon size={20} className="text-primary" />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
            <Star size={20} className="text-primary" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-secondary">Dashboards</span>
          <span className="text-muted">/</span>
          <span className="text-primary">Default</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-white/10 rounded-lg py-1.5 pl-9 pr-12 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand w-40 transition-all focus:w-64"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-[10px] font-medium">
            ⌘/
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary">
            <Sun size={20} />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary">
            <Clock size={20} />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary">
            <Bell size={20} />
          </button>
          <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-primary">
            <Layout size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
