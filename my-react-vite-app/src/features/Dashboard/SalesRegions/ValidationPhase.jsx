import React from 'react';

const ValidationPhase = ({ validationData, onConfirm, onCancel, loading }) => {
  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      
      {/* Validation Stepper Header */}
      <div className="flex justify-center items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-green-600 font-bold text-sm"><div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">✓</div> 1. Select File</div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-2 text-red-600 font-bold text-sm"><div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">!</div> 2. Validate (Error)</div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm"><div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</div> 3. Confirm</div>
      </div>

      {/* Error Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">!</div>
          <h3 className="text-lg font-bold text-red-800">Below SKU is not available</h3>
        </div>
        <p className="text-sm text-red-600 ml-9">The following identifiers were not found in the Material Master. Please update the master data or exclude them.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Unmapped Entries Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-red-500 tracking-wider uppercase mb-4 flex items-center gap-2"><span>⊗</span> Unmapped Entries ({validationData?.errorCount})</h4>
            <div className="space-y-2 mb-6">
              {validationData?.missingSkus.map(sku => (
                <div key={sku} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> {sku}
                </div>
              ))}
            </div>
            <button className="w-full py-2 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition">Export Missing SKUs</button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Summary</p>
              <p className="text-3xl font-bold text-gray-900">{validationData?.validCount}</p>
              <p className="text-xs text-gray-500 mt-1">Total Rows Processed</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">99.7%</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Valid Data Preview Table */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Valid Data Preview</h3>
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{validationData?.validCount} Valid Rows</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50/50">
                <th className="p-4 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">SKU Code</th>
                <th className="p-4 font-bold">Quantity</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Region</th>
              </tr>
            </thead>
            <tbody>
              {validationData?.validPreview.map(row => (
                <tr key={row.id} className="border-b border-gray-50">
                  <td className="p-4 font-medium text-gray-700">{row.id}</td>
                  <td className="p-4 font-bold text-gray-900">{row.sku}</td>
                  <td className="p-4 text-gray-600">{row.qty}</td>
                  <td className="p-4 font-medium text-gray-900">{row.price}</td>
                  <td className="p-4 text-gray-500">{row.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs">i</span>
          Found <strong className="text-red-500">{validationData?.errorCount} errors</strong> in {validationData?.totalRows} total records.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-6 py-2.5 bg-[#4f46e5] text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
            {loading ? 'Processing...' : 'Confirm & Save Valid Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationPhase;