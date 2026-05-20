import React, { useState, useEffect } from 'react';
import { fetchAuditLogs } from './admin.service';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchAuditLogs();
      setLogs(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Helper to colorize the Action badges
  const getActionBadge = (action) => {
    switch (action) {
      case 'EDIT': return 'bg-indigo-100 text-indigo-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      case 'CREATE': return 'bg-purple-100 text-purple-700';
      case 'LOGIN': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Mock data for the bar chart
  const chartBars = [20, 35, 30, 60, 50, 75, 80, 45, 25, 40, 95, 70, 40, 35];

  return (
    <div className="max-w-7xl mx-auto w-full pb-6 font-sans">
      
      {/* Header Area */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-1">Comprehensive security and activity trail for enterprise administration.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 shadow-sm hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Export Logs
          </button>
          <button className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#4338ca]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">📊</div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Events (24H)</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">42,891</p>
          <span className="absolute top-5 right-5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">+12.4%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3">🛡️</div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Security Alerts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">03</p>
          <span className="absolute top-5 right-5 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">Attention</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mb-3">🔒</div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unique Active Admins</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Date Range</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">User Role</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>All Roles</option>
              <option>System Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Action Type</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>All Actions</option>
              <option>EDIT</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Module</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>All Modules</option>
              <option>Licenses</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Status</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>All Status</option>
              <option>Success</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[calc(20%-0.8rem)]">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Severity</label>
            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-indigo-500">
              <option>All Severity</option>
              <option>High</option>
            </select>
          </div>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-5">Clear All</button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6 flex flex-col">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">Loading audit logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
                  <th className="p-4 font-bold pl-6">Timestamp</th>
                  <th className="p-4 font-bold">User</th>
                  <th className="p-4 font-bold">Action</th>
                  <th className="p-4 font-bold">Module</th>
                  <th className="p-4 font-bold w-1/3">Description</th>
                  <th className="p-4 font-bold">IP Address</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 pl-6 text-gray-600 font-mono text-xs">{log.timestamp}</td>
                    <td className="p-4 flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${log.avatarColor}`}>
                        {log.initials}
                      </div>
                      <span className="font-bold text-gray-900">{log.user}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{log.module}</td>
                    <td className="p-4 text-gray-600 leading-tight pr-8">{log.description}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-white">
          <span>Showing 1 to 5 of 1,240 entries</span>
          <div className="flex gap-1 items-center">
            <button className="px-2 py-1 text-gray-400 hover:text-gray-600">&lt;</button>
            <button className="px-3 py-1 bg-[#4f46e5] text-white rounded font-medium shadow-sm">1</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded text-gray-700 font-medium">2</button>
            <button className="px-3 py-1 hover:bg-gray-100 rounded text-gray-700 font-medium">3</button>
            <span className="px-1 py-1">...</span>
            <button className="px-3 py-1 hover:bg-gray-100 rounded text-gray-700 font-medium">248</button>
            <button className="px-2 py-1 text-gray-700 hover:text-gray-900 font-bold">&gt;</button>
          </div>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-3 gap-6 h-64">
        {/* Activity Velocity Chart Component */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-900">Activity Velocity</h3>
            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> System</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span> User</span>
            </div>
          </div>
          
          {/* Pure CSS Bar Chart */}
          <div className="flex-1 flex items-end justify-between gap-1 mt-2">
            {chartBars.map((height, i) => (
              <div 
                key={i} 
                className={`w-full rounded-t-sm transition-all duration-500 ${height > 70 ? 'bg-indigo-600' : height > 40 ? 'bg-indigo-400' : 'bg-indigo-200'}`}
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Live Security Monitoring Card */}
        <div className="col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Live Security Monitoring</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Encryption layers are active and multi-factor authentication is enforced across all 12 active admin sessions.
            </p>
          </div>
          <button className="w-full bg-white text-indigo-700 font-bold text-sm py-3 rounded-lg hover:bg-gray-50 transition-colors mt-4">
            Security Audit Checklist
          </button>
        </div>
      </div>

    </div>
  );
};

export default AuditLogs;