import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return; // Only allow numbers
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value !== '' && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to focus previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful verification
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      {/* Top Header */}
      <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white rounded-sm"></div>
          </div>
          <span className="font-bold text-gray-900">Enterprise Planning</span>
        </div>
        <div className="flex gap-4 text-gray-500">
          <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-md text-center">
          
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-500 mb-8">Enter the 5-digit code sent to your email</p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
              ))}
            </div>

            <button type="submit" className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-medium py-3 rounded-lg transition-colors duration-200 mb-6">
              Verify
            </button>
          </form>

          <div className="space-y-3 text-sm">
            <p className="text-gray-500">
              Resend code <span className="text-indigo-600 font-medium">in 0:45</span>
            </p>
            <button className="text-indigo-600 font-medium hover:text-indigo-800">
              Use backup code instead
            </button>
          </div>
        </div>
      </main>

      {/* Footer Area */}
      <div className="absolute bottom-6 w-full text-center text-xs text-gray-400 uppercase tracking-widest font-semibold flex flex-col gap-3">
        <div className="flex justify-center items-center gap-1 text-gray-600">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          SECURED BY ENTERPRISE SHIELD
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;