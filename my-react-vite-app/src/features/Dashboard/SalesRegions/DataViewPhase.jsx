import React from 'react';

const DataViewPhase = ({ tableData, loading, onUploadMore }) => {
  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Regions Data</h2>
          <p className="text-sm text-gray-500 mt-2">Review and analyze historical transaction data across all regions and periods.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onUploadMore} className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
            + Upload More
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export Data
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
        
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex gap-4 items-end bg-gray-50/50">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">SKU / Product Name</label>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="e.g. Widget Pro" className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sales Region</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-indigo-500">
              <option>All Regions</option>
              <option>North America</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Period</label>
            <select className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-indigo-500">
              <option>Last 30 Days</option>
              <option>Q1 2024</option>
            </select>
          </div>
          <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 px-2">Reset</button>
          <button className="px-5 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700">Apply Filters</button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
                <th className="p-4 pl-6 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">Region</th>
                <th className="p-4 font-bold">Period</th>
                <th className="p-4 font-bold text-right">Quantity</th>
                <th className="p-4 font-bold text-right">Total Value</th>
                <th className="p-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500 font-medium">Loading sales records...</td></tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="p-4 pl-6 text-gray-600 font-medium">{row.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{row.product}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-wide mt-0.5">SKU: {row.sku}</p>
                    </td>
                    <td className="p-4 text-gray-700 font-medium">{row.region}</td>
                    <td className="p-4 text-gray-600">{row.period}</td>
                    <td className="p-4 text-right text-gray-700">{row.qty}</td>
                    <td className="p-4 text-right font-bold text-gray-900">{row.value}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Confirmed' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataViewPhase;