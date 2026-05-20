import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Note: Navigating up one level to find the dashboard service
import { simulateExcelUpload, validateMaterialMapping, confirmBulkMaterialUpload } from '../dashboard.service';

// Import our newly separated phases
import SelectFilePhase from './SelectFilePhase';
import MapColumnsPhase from './MapColumnsPhase';
import ValidatePhase from './ValidatePhase';
import ConfirmPhase from './ConfirmPhase';

const BulkUpload = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Stored Data across steps
  const [fileMeta, setFileMeta] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [resultData, setResultData] = useState(null);

  // --- Handlers ---
  const handleFileUpload = async () => {
    setLoading(true);
    const data = await simulateExcelUpload();
    setFileMeta(data);
    setLoading(false);
    setStep(2); 
  };

  const handleValidateMapping = async () => {
    setLoading(true);
    const data = await validateMaterialMapping();
    setValidationData(data);
    setLoading(false);
    setStep(3);
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    const result = await confirmBulkMaterialUpload(validationData.validPreview);
    setResultData(result);
    setLoading(false);
    setStep(4);
  };

  const finishWizard = () => {
    navigate('/dashboard/materials'); 
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard/materials')}>Console</span> 
            <span className="mx-1">&gt;</span> 
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard/materials')}>Material Master</span> 
            <span className="mx-1">&gt;</span> 
            <span className="text-[#2563eb]">Bulk Upload</span>
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Upload Material Master</h2>
          <p className="text-sm text-gray-500 mt-1">Ingest bulk material data into the enterprise repository.</p>
        </div>
        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 shadow-sm hover:bg-gray-50 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download Template
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full max-w-4xl mx-auto mb-10 relative">
        <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-200 -z-10"></div>
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
          {[
            { id: 1, label: 'Select File' },
            { id: 2, label: 'Map Columns' },
            { id: 3, label: 'Validate' },
            { id: 4, label: 'Confirm' }
          ].map(s => (
            <div key={s.id} className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-[#2563eb]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= s.id ? 'bg-[#2563eb] text-white shadow-md' : 'bg-gray-100'}`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Render the Active Phase Component */}
      {step === 1 && <SelectFilePhase onNext={handleFileUpload} loading={loading} />}
      {step === 2 && <MapColumnsPhase onNext={handleValidateMapping} onBack={() => setStep(1)} fileMeta={fileMeta} loading={loading} />}
      {step === 3 && <ValidatePhase onNext={handleConfirmImport} onBack={() => setStep(2)} validationData={validationData} loading={loading} />}
      {step === 4 && <ConfirmPhase onFinish={finishWizard} resultData={resultData} />}
    </div>
  );
};

export default BulkUpload;