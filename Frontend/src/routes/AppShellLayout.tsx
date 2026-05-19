import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { RightBar } from '../components/layout/RightBar';

export const AppShellLayout = () => (
  <div className="min-h-screen bg-background font-sans text-primary flex overflow-hidden">
    <Sidebar />
    <main className="flex-1 lg:ml-[212px] xl:mr-[280px] min-h-screen flex flex-col overflow-y-auto">
      <Topbar />
      <div className="flex-1 pb-10">
        <Outlet />
      </div>
    </main>
    <RightBar />
  </div>
);
