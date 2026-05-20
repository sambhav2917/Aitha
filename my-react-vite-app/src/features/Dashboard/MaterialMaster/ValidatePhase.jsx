import React from 'react';

const ValidatePhase = ({ validationData, onNext, onBack, loading }) => (
  <div className="space-y-6">
    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">!</div>
        <h3 className="text-lg font-bold text-red-800">Review Required</h3>
      </div>
      <p className="text-sm text-red-600 ml-9">Found {validationData?.errorCount} unrecognized groups. They will be ignored during import.</p>
    </div>

    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-900">Valid Data Preview</h3>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">{validationData?.validCount} Ready to Import</span>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
            <th className="p-4 font-bold">Product ID</th>
            <th className="p-4 font-bold">Name</th>
            <th className="p-4 font-bold">Type</th>
            <th className="p-4 font-bold">Region</th>
          </tr>
        </thead>
        <tbody>
          {validationData?.validPreview.map(row => (
            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="p-4 font-bold text-indigo-600">{row.id}</td>
              <td className="p-4 font-bold text-gray-900">{row.name}</td>
              <td className="p-4 text-gray-600">{row.type}</td>
              <td className="p-4 text-gray-500">{row.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="flex justify-end gap-3">
      <button onClick={onBack} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Back to Mapping</button>
      <button onClick={onNext} disabled={loading} className="px-6 py-2.5 bg-[#4f46e5] text-white font-bold rounded-lg hover:bg-indigo-700 transition">
        {loading ? 'Importing...' : 'Confirm & Import Data'}
      </button>
    </div>
  </div>
);

export default ValidatePhase;