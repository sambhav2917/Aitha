import React, { useState, useEffect } from 'react';
import { fetchLicenses } from './admin.service';

const Licenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchLicenses();
      setLicenses(data);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full pb-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">License Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage subscription lifecycle, seat allocations, and renewal cycles.</p>
        </div>
        <button className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#4338ca]">
          Sync Licenses
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <p className="text-sm font-medium text-gray-500">Total Active Licenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,284 <span className="text-sm text-indigo-600 ml-2">+3.2%</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <p className="text-sm font-medium text-gray-500">Expiring in 30 Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">42 <span className="text-sm text-red-500 font-bold ml-2">Critical</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <p className="text-sm font-medium text-gray-500">Recent Renewals</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">18 <span className="text-sm text-gray-500 ml-2 font-normal">This week</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <p className="text-sm font-medium text-gray-500">Revenue (MTD)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">$342.8k <span className="text-sm text-indigo-600 ml-2">+12%</span></p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">Fetching license data...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50/50">
                <th className="p-4 font-bold">Company Name</th>
                <th className="p-4 font-bold">Plan Type</th>
                <th className="p-4 font-bold">License Key</th>
                <th className="p-4 font-bold">Seats (Used/Total)</th>
                <th className="p-4 font-bold">Next Renewal</th>
                <th className="p-4 font-bold">Auto-Renew</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {licenses.map((lic, idx) => {
                const percent = (lic.seatsUsed / lic.seatsTotal) * 100;
                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${lic.color}`}>{lic.id}</div>
                      <span className="font-bold text-gray-900">{lic.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-700">{lic.plan}</span>
                    </td>
                    <td className="p-4 font-mono text-gray-500 tracking-wider">{lic.key}</td>
                    <td className="p-4 w-48">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-gray-900">{lic.seatsUsed} / {lic.seatsTotal}</span>
                        <span className={percent > 90 ? 'text-red-500' : 'text-gray-500'}>{Math.round(percent)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${percent > 90 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${percent}%` }}></div>
                      </div>
                    </td>
                    <td className={`p-4 font-medium ${lic.expiring ? 'text-red-600' : 'text-gray-600'}`}>
                      {lic.renewal}
                      {lic.expiring && <div className="text-[10px] text-red-500 uppercase tracking-wider font-bold">Expiring Soon</div>}
                    </td>
                    <td className="p-4 text-xs font-bold">
                      {lic.autoRenew ? <span className="text-indigo-600 flex items-center gap-1">✓ ON</span> : <span className="text-gray-400 flex items-center gap-1">✕ OFF</span>}
                    </td>
                    <td className="p-4 text-gray-400 flex gap-2 cursor-pointer">
                       <span>✏️</span> <span>🚀</span> <span>⏱</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Widgets */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col justify-between">
            <div className="flex justify-between font-bold text-gray-900 mb-4">
                <span>Regional License Distribution</span>
                <span className="text-xs text-gray-400 font-normal">Global Reach</span>
            </div>
            {/* Placeholder for map */}
            <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-dashed border-gray-300">Map Visualization Area</div>
        </div>
        
        <div className="bg-indigo-500 rounded-xl p-6 text-white shadow-sm relative overflow-hidden h-64">
           <h3 className="font-bold text-lg mb-2 relative z-10">Optimization Tip</h3>
           <p className="text-indigo-100 text-sm relative z-10 leading-relaxed">
             12% of licenses in the 'Pro' tier have under 10% seat utilization. Consider suggesting a downgrade for cost optimization.
           </p>
           {/* Decorative background shapes */}
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
           <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Licenses;