import React, { useState, useEffect } from 'react';
import { validateSalesUpload, confirmSalesUpload, fetchSalesRegions } from '../dashboard.service';

// Import our new split components
import UploadPhase from './UploadPhase';
import ValidationPhase from './ValidationPhase';
import DataViewPhase from './DataViewPhase';

const SalesRegions = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Validate, 3: View Data
  const [loading, setLoading] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [tableData, setTableData] = useState([]);

  // --- Core Action Handlers ---
  const handleSimulateUpload = async () => {
    setLoading(true);
    try {
      const data = await validateSalesUpload();
      setValidationData(data);
      setStep(2); // Transition to Validation Phase
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    setLoading(true);
    try {
      await confirmSalesUpload(validationData.validPreview);
      loadFinalData();
      setStep(3); // Transition to Data View Phase
    } catch (error) {
      console.error("Confirmation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFinalData = async () => {
    setLoading(true);
    const data = await fetchSalesRegions();
    setTableData(data);
    setLoading(false);
  };

  // Ensure data loads when we arrive directly at Step 3
  useEffect(() => {
    if (step === 3) {
      loadFinalData();
    }
  }, [step]);

  // --- Render Logic ---
  return (
    <>
      {step === 1 && (
        <UploadPhase 
          loading={loading} 
          onSimulateUpload={handleSimulateUpload} 
        />
      )}
      
      {step === 2 && (
        <ValidationPhase 
          loading={loading} 
          validationData={validationData} 
          onConfirm={handleConfirmUpload} 
          onCancel={() => setStep(1)} 
        />
      )}
      
      {step === 3 && (
        <DataViewPhase 
          loading={loading} 
          tableData={tableData} 
          onUploadMore={() => setStep(1)} 
        />
      )}
    </>
  );
};

export default SalesRegions;