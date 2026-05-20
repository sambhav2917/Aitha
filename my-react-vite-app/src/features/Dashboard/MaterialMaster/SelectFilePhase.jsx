import React from 'react';

const SelectFilePhase = ({ onNext, loading }) => (
  <div className="grid grid-cols-3 gap-8">
    <div className="col-span-2 bg-white border-2 border-dashed border-gray-200 hover:border-[#4f46e5] hover:bg-indigo-50/30 transition-all rounded-xl flex flex-col items-center justify-center p-16 h-[400px]">
      {loading ? (
        <div className="flex flex-col items-center text-[#4f46e5]">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5] mb-4"></div>
           <p className="font-bold">Reading Excel File...</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-600 shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload your data file</h3>
          <p className="text-gray-500 text-sm mb-6 text-center leading-relaxed">Drag and drop your Material Master Excel or CSV file<br/>here, or browse your computer.</p>
          <button onClick={onNext} className="px-8 py-3 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors">
            Browse Files
          </button>
          <p className="text-[10px] text-gray-400 font-bold mt-5 tracking-wide uppercase">Supported formats: .XLSX, .CSV (Max 50MB)</p>
        </>
      )}
    </div>

    <div className="col-span-1 relative">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 h-[400px] overflow-y-auto shadow-inner">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <span className="text-blue-600 text-lg">⚡</span> Required Attributes
        </h4>
        <div className="space-y-2.5 text-xs font-bold">
          {['PRODUCT_ID', 'PRODUCT_DESCRIPTION', 'TYPE', 'SALES_REGION'].map(attr => (
            <div key={attr} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <span className="text-gray-700 tracking-wide">{attr}</span>
              <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded uppercase tracking-wider">Required</span>
            </div>
          ))}
          {['GROUP', 'OLD_PRODUCT_ID'].map(attr => (
            <div key={attr} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm opacity-70">
              <span className="text-gray-600 tracking-wide">{attr}</span>
              <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">Optional</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-6 left-0 right-0 bg-gradient-to-br from-[#2563eb] to-blue-700 text-white p-5 rounded-xl shadow-lg border border-blue-400 z-10">
        <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">Data Quality Tip</h4>
        <p className="text-xs text-blue-100 leading-relaxed pr-6 mt-1">Ensure all SKU codes follow the EAN-13 format for automated validation.</p>
      </div>
    </div>
  </div>
);

export default SelectFilePhase;