import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const adminLayout = () => {
  const location = useLocation();

  // Helper function to highlight the active tab
  const getNavClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center mr-3">
               <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Aitha</h1>
              <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Admin Console</p>
            </div>
          </div>
          
          <nav className="p-4 space-y-1">
            <Link to="/admin/companies" className={getNavClass('/admin/companies')}>
              <span>🏢</span> Company Management
            </Link>
            <Link to="/admin/licenses" className={getNavClass('/admin/licenses')}>
              <span>🔑</span> Licenses
            </Link>
            <Link to="/admin/settings" className={getNavClass('/admin/settings')}>
              <span>⚙️</span> System Settings
            </Link>
            <Link to="/admin/audit" className={getNavClass('/admin/audit')}>
              <span>📋</span> Audit Logs
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input type="text" placeholder="Search resources..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="flex items-center gap-6">
            <span className="text-gray-500 cursor-pointer">❓</span>
            <span className="text-gray-500 cursor-pointer">🔔</span>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold">AR</div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-gray-900">Alex Rivera</p>
                <p className="text-[10px] font-bold text-indigo-600 tracking-wider">SYSTEM ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Injected Here */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default adminLayout;