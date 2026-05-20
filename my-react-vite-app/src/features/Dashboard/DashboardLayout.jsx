import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Updated to match the screenshot's left-border active state
  const getNavClass = (path) => {
    const isActive = location.pathname.includes(path);
    return `flex items-center gap-3 px-6 py-3 font-semibold text-[13px] transition-colors ${
      isActive 
        ? 'bg-indigo-50/80 text-indigo-700 border-l-4 border-indigo-600' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-4 border-transparent'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      
      {/* Sidebar - Aitha Enterprise Planning Style */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo Area */}
          <div className="h-20 flex items-center px-6 mb-2">
            <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center mr-3 shadow-sm">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
               </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight tracking-tight">Aitha</h1>
              <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">Enterprise Planning</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col">
            <Link to="/dashboard/home" className={getNavClass('/dashboard/home')}>
              <span className="w-5 flex justify-center text-lg">🎛️</span> Dashboard
            </Link>
            <Link to="/dashboard/history" className={getNavClass('/dashboard/history')}>
              <span className="w-5 flex justify-center text-lg">⏱</span> Sales History
            </Link>
            <Link to="/dashboard/materials" className={getNavClass('/dashboard/materials')}>
              <span className="w-5 flex justify-center text-lg">📦</span> Material Master
            </Link>
            <Link to="/dashboard/warehouse" className={getNavClass('/dashboard/warehouse')}>
              <span className="w-5 flex justify-center text-lg">🏢</span> Warehouse Master
            </Link>
            <Link to="/dashboard/regions" className={getNavClass('/dashboard/regions')}>
              <span className="w-5 flex justify-center text-lg">🌍</span> Sales Regions
            </Link>
            <Link to="/dashboard/forecasting" className={getNavClass('/dashboard/forecasting')}>
              <span className="w-5 flex justify-center text-lg text-indigo-500">📈</span> Forecasting
            </Link>
            <Link to="/dashboard/production" className={getNavClass('/dashboard/production')}>
              <span className="w-5 flex justify-center text-lg">🏭</span> Production
            </Link>
            <Link to="/dashboard/distribution" className={getNavClass('/dashboard/distribution')}>
              <span className="w-5 flex justify-center text-lg">🚚</span> Distribution
            </Link>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-9 h-9 bg-gray-200 rounded-full border border-gray-300 overflow-hidden shrink-0">
            <img src="https://i.pravatar.cc/150?img=11" alt="J. Doe" className="w-full h-full object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900">J. Doe</p>
            <p className="text-[10px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wide">Planner</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-8">
            {/* Optional Breadcrumb or Top Nav space if needed */}
          </div>
          <div className="flex items-center gap-5">
            <span className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <span className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;