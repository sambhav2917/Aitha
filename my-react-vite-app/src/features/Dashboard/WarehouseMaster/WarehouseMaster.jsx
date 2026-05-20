import React, { useState, useEffect } from 'react';
import { fetchWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../dashboard.service';
import WarehouseDrawer from './WarehouseDrawer';

const WarehouseMaster = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('create'); // 'create' or 'edit'
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchWarehouses();
    setWarehouses(data);
    setLoading(false);
  };

  // --- Handlers ---
  const handleOpenCreate = () => {
    setDrawerMode('create');
    setSelectedWarehouse(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (warehouse) => {
    setDrawerMode('edit');
    setSelectedWarehouse(warehouse);
    setIsDrawerOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    if (drawerMode === 'create') {
      await createWarehouse(formData);
    } else {
      await updateWarehouse(formData.id, formData);
    }
    setIsDrawerOpen(false);
    setIsSaving(false);
    loadData();
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to mark this warehouse as Inactive?")) {
      await deleteWarehouse(id);
      loadData();
    }
  };

  // --- Calculations ---
  const totalCapacity = warehouses.reduce((sum, w) => sum + (Number(w.capacity) || 0), 0);
  const activeHubs = warehouses.filter(w => w.type === 'HUB' && w.status === 'Operational').length;

  const filteredData = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6 relative">
      
      <WarehouseDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        mode={drawerMode} 
        warehouse={selectedWarehouse} 
        onSave={handleSave} 
        isSaving={isSaving} 
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Warehouse Master</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Centralized repository for all enterprise storage facilities. Manage logistics capacities, operational statuses, and geographic distributions.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
          <span>+</span> Add Warehouse
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Warehouses</p>
            <p className="text-3xl font-bold text-gray-900">{warehouses.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Capacity</p>
            <p className="text-3xl font-bold text-gray-900">{(totalCapacity / 1000).toFixed(1)}k <span className="text-lg text-gray-500 font-medium">m³</span></p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Hubs</p>
            <p className="text-3xl font-bold text-gray-900">{activeHubs}</p>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col mb-8">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div className="relative w-[400px]">
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} placeholder="Search by Warehouse ID or Name" className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg> Filter
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="p-4 pl-6 font-bold">Warehouse ID</th>
                <th className="p-4 font-bold">Warehouse Name</th>
                <th className="p-4 font-bold">Location</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold text-right">Capacity (m³)</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">Loading warehouses...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">No warehouses found.</td></tr>
              ) : (
                paginatedData.map((wh) => (
                  <tr key={wh.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="p-4 pl-6 font-bold text-blue-600 text-xs tracking-wide">{wh.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{wh.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">Manager: {wh.manager}</p>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{wh.location}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        wh.type === 'HUB' ? 'bg-blue-100 text-blue-800' : 
                        wh.type === 'DC' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                      }`}>{wh.type}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-gray-700">{wh.capacity.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-xs text-gray-700">
                        <div className={`w-2 h-2 rounded-full ${
                          wh.status === 'Operational' ? 'bg-green-500' : 
                          wh.status === 'Maintenance' ? 'bg-orange-500' : 'bg-gray-400'
                        }`}></div>
                        {wh.status}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2 text-gray-400">
                        <button onClick={() => handleOpenEdit(wh)} className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDelete(wh.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white rounded-b-xl uppercase tracking-wider font-bold">
            <span>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} Warehouses</span>
            <div className="flex gap-2 items-center text-sm">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#4f46e5] text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100">25</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Widgets Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Network Density Analysis */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between relative overflow-hidden">
          <div className="w-1/2 z-10">
            <h3 className="font-bold text-gray-900 mb-1">Network Density Analysis</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">Real-time heat map of warehouse utilization and capacity across North American hubs.</p>
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top Utilization</p>
                <p className="text-lg font-bold text-gray-900">Texas (89%)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expansion Target</p>
                <p className="text-lg font-bold text-blue-600">Pacific NW</p>
              </div>
            </div>
          </div>
          {/* Abstract Map Graphic Placeholder */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gray-900 rounded-l-full translate-x-12 opacity-90 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
          </div>
        </div>

        {/* Insights & Maintenance */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#4f46e5] to-blue-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <svg className="w-6 h-6 text-blue-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <h3 className="font-bold text-lg mb-2">Efficiency Insights</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">Consolidating Regional Annexes into Central Hubs in the NE territory could reduce overhead by 14.2% per quarter.</p>
            <button className="text-xs font-bold flex items-center gap-1 hover:text-blue-200 transition-colors">View Optimization Plan →</button>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white rounded-full opacity-10"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Upcoming Maintenance</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">WH-NY-012 HVAC Service</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Scheduled: Oct 14, 08:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">WH-TX-001 Belt Calibration</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Scheduled: Oct 15, 11:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseMaster;