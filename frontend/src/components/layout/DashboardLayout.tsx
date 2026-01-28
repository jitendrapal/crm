import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {/* Add padding-top on mobile to account for hamburger menu button */}
      <div className="flex-1 overflow-auto md:pt-0 pt-16">
        <Outlet />
      </div>
    </div>
  );
}
