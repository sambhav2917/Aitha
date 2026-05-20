import React from 'react';

const ConfirmPhase = ({ resultData, onFinish }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
    </div>
    <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Complete!</h2>
    <p className="text-gray-500 mb-8 max-w-md">Successfully imported <strong className="text-gray-900">{resultData?.count}</strong> material records into the enterprise repository.</p>
    
    <button onClick={onFinish} className="px-8 py-3 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition">
      View Material Master
    </button>
  </div>
);

export default ConfirmPhase;