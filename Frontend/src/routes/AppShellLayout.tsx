import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { RightDrawer } from '../components/layout/RightDrawer';

export const AppShellLayout = () => (
  <div className="min-h-screen bg-background font-sans text-primary flex overflow-hidden">
    <Sidebar />
    <main className="flex-1 lg:ml-[212px] min-h-screen flex flex-col overflow-y-auto">
      <Topbar />
      <div className="flex-1 pb-10">
        <Outlet />
      </div>
    </main>
    <RightDrawer />
  </div>
);
