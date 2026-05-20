import React from 'react';

const UploadPhase = ({ onSimulateUpload, loading }) => {
  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Sales Data</h2>
          <p className="text-sm text-gray-500 mt-1">Process high-volume transaction records instantly. Our intelligent parser will automatically map your columns.</p>
        </div>
        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 shadow-sm hover:bg-gray-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Template
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Drag & Drop Area */}
        <div className="col-span-2 bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-16 h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center text-blue-600">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
               <p className="font-bold">Analyzing file...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Drag and drop files here</h3>
              <p className="text-gray-500 text-sm mb-8">Upload your CSV or XLSX sales reports. Maximum file size 50MB.</p>
              <button onClick={onSimulateUpload} className="px-8 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition">
                Select Files from Computer
              </button>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#4f46e5] rounded-xl p-6 text-white shadow-md">
            <p className="text-xs font-bold text-indigo-200 tracking-wider uppercase mb-2">Last Batch Status</p>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">Success</h3>
              <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">✓</div>
            </div>
            <div className="flex justify-between text-sm border-t border-indigo-400/50 pt-3 mb-2">
              <span className="text-indigo-100">Total Rows</span>
              <span className="font-bold">12,482</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-indigo-100">Processing Time</span>
              <span className="font-bold">1.2s</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-yellow-500">💡</span> Upload Checklist</h4>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3"><div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-xs font-bold">1</div><div><p className="font-bold text-gray-900">Use correct headers</p><p className="text-xs text-gray-500 mt-0.5">Ensure Date, Product_ID match schema.</p></div></div>
              <div className="flex gap-3"><div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-xs font-bold">2</div><div><p className="font-bold text-gray-900">ISO Currency</p><p className="text-xs text-gray-500 mt-0.5">Standard 3-letter codes (e.g. USD).</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPhase;