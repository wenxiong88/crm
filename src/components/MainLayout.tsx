import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationSidebar } from './NavigationSidebar';
import { Header } from './Header';

export function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <NavigationSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto px-6 py-4 relative">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
