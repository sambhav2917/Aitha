import React from 'react';

const MapColumnsPhase = ({ onNext, onBack, fileMeta, loading }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Map Columns</h3>
        <p className="text-sm text-gray-500">Match the columns from <strong className="text-indigo-600">{fileMeta?.fileName}</strong> to system attributes.</p>
      </div>
      <span className="bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg">{fileMeta?.rowCount} Rows Detected</span>
    </div>

    <div className="space-y-4 mb-8">
      {['PRODUCT_ID', 'PRODUCT_DESCRIPTION', 'TYPE', 'SALES_REGION'].map((field, i) => (
        <div key={i} className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="w-1/3 font-bold text-sm text-gray-700">{field} <span className="text-red-500">*</span></div>
          <div className="text-gray-400">➔</div>
          <select className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#4f46e5]">
            <option>{field} (Auto-Mapped)</option>
            <option>Column A</option>
            <option>Column B</option>
          </select>
        </div>
      ))}
    </div>

    <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
      <button onClick={onBack} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Back</button>
      <button onClick={onNext} disabled={loading} className="px-6 py-2.5 bg-[#4f46e5] text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
        {loading ? 'Validating...' : 'Run Validation'}
      </button>
    </div>
  </div>
);

export default MapColumnsPhase;