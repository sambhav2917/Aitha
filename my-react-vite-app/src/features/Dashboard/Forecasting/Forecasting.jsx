import React, { useState } from 'react';
import { executeForecastGeneration } from '../dashboard.service';

// Import our two phases
import GeneratePhase from './GeneratePhase';
import ResultsPhase from './ResultsPhase';

const Forecasting = () => {
  const [step, setStep] = useState(1); // 1: Config Form, 2: Results Dashboard
  const [loading, setLoading] = useState(false);

  const handleExecute = async (configData) => {
    setLoading(true);
    try {
      await executeForecastGeneration(configData);
      setStep(2); // Jump to Results
    } catch (error) {
      console.error("Forecast generation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = () => {
    setStep(1); // Jump back to Config Form
  };

  return (
    <>
      {step === 1 && (
        <GeneratePhase 
          loading={loading} 
          onExecute={handleExecute} 
        />
      )}
      
      {step === 2 && (
        <ResultsPhase 
          onAdjustParameters={handleAdjust} 
        />
      )}
    </>
  );
};

export default Forecasting;