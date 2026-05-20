import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Import useNavigate
import { loginUser } from './auth.service';
import { handleLoginError } from './auth.utils';

const Login = () => {
  const navigate = useNavigate(); // <-- 2. Initialize the hook
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(formData);
      console.log('Login Success:', data);
      
      // 3. Redirect to the 2FA page instead of showing an alert!
      navigate('/2fa'); 
      
    } catch (err) {
      setError(handleLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4 font-sans">
      
      {/* Header / Logo Area */}
      <div className="text-center mb-8">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
          {/* Simple SVG icon resembling the logo */}
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AiEtha</h1>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 mt-1">ENTERPRISE PLANNING PLATFORM</p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 w-full max-w-md relative z-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          
          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 tracking-wide mb-2">EMAIL ADDRESS</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold text-gray-700 tracking-wide">PASSWORD</label>
              <a href="#" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded bg-gray-50 cursor-pointer"
              onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
            />
            <label htmlFor="remember" className="ml-2.5 text-[13px] font-medium text-gray-700 cursor-pointer">
              Stay signed in for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold py-3 rounded-lg transition-colors duration-200 text-sm tracking-wide mt-2"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN TO DASHBOARD'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] tracking-wider font-bold">
            <span className="bg-white px-3 text-gray-400 uppercase">Or continue with</span>
          </div>
        </div>

        {/* SSO Button */}
        <button className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white py-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Single Sign-On (SSO)</span>
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-8 text-center relative z-10">
        <div className="flex justify-center space-x-6 text-[11px] font-bold text-gray-400 tracking-wider mb-4">
          <a href="#" className="hover:text-gray-600 transition-colors">PRIVACY POLICY</a>
          <a href="#" className="hover:text-gray-600 transition-colors">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-gray-600 transition-colors">SUPPORT</a>
        </div>
        <p className="text-[10px] text-gray-400 tracking-wider">
          © 2024 ENTERPRISE PLANNING PLATFORM. ALL RIGHTS RESERVED.
        </p>
      </div>
      
      {/* Background soft gradient blob (optional, matches the image aesthetic) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/30 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/30 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Login;