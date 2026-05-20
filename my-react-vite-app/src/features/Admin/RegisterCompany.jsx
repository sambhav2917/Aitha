import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCompany } from './admin.service';

const RegisterCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Setup State for the Form
  const [formData, setFormData] = useState({
    name: '', code: '', country: 'USA', address1: '', address2: '',
    city: '', state: '', contactName: '', email: '', mobile: '',
    officePhone: '', accountType: 'PAID POC', start: '', end: '',
    bankName: '', accountNo: '', ifsc: '', branch: '', gst: '', pan: ''
  });

  // 2. Setup State for Errors
  const [errors, setErrors] = useState({});

  // 3. Universal change handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear the specific error as soon as the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // 4. Submit Handler with Field-Level Validation
  const handleSubmit = async () => {
    const newErrors = {};

    // Validate Required Fields
    if (!formData.name.trim()) newErrors.name = "Company Name is required";
    if (!formData.code.trim()) newErrors.code = "Company Code is required";
    if (!formData.address1.trim()) newErrors.address1 = "Address Line 1 is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.contactName.trim()) newErrors.contactName = "Primary Contact Name is required";
    
    // Basic Email Validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile Phone is required";

    // If there are errors, stop submission and show them
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed with API Call if no errors
    setLoading(true);
    try {
      await registerCompany(formData);
      navigate('/admin/companies');
    } catch (error) {
      console.error("Registration failed", error);
      alert("Something went wrong while saving to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to dynamically set input classes based on error state
  const getInputClass = (fieldName) => `
    w-full rounded-lg px-4 py-2.5 text-sm transition-colors focus:outline-none 
    ${errors[fieldName] 
      ? 'bg-red-50 border-2 border-red-400 focus:border-red-500' 
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white'}
  `;

  return (
    <div className="max-w-7xl mx-auto w-full pb-6 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/admin/companies')}>Admin Console</span> 
            <span className="mx-1">&gt;</span> 
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/admin/companies')}>Company Management</span> 
            <span className="mx-1">&gt;</span> 
            <span className="text-indigo-600">Register Company</span>
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Register New Company</h2>
          <p className="text-sm text-gray-500 mt-1">Onboard a new multi-tenant instance with administrative and billing configurations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/companies')}
            className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#4338ca] disabled:opacity-50"
          >
            <span>💾</span> {loading ? 'Saving...' : 'Save Registration'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="col-span-2 space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-indigo-600">🏢</span> Company Information
              </h3>
              <span className="text-xs font-bold text-indigo-600">* Required Fields</span>
            </div>

            <div className="space-y-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Company Name <span className="text-indigo-600">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Legal entity name" className={getInputClass('name')} />
                {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Company Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Company Code <span className="text-indigo-600">*</span></label>
                  <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="Short identifier (e.g., TECH01)" className={getInputClass('code')} />
                  {errors.code && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.code}</p>}
                </div>
                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Country <span className="text-indigo-600">*</span></label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors">
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>

              {/* Address 1 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Address Line 1 <span className="text-indigo-600">*</span></label>
                <input type="text" name="address1" value={formData.address1} onChange={handleChange} placeholder="Street address, P.O. box, company name" className={getInputClass('address1')} />
                {errors.address1 && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.address1}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City <span className="text-indigo-600">*</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={getInputClass('city')} />
                  {errors.city && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.city}</p>}
                </div>
                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">State / Province <span className="text-indigo-600">*</span></label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={getInputClass('state')} />
                  {errors.state && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.state}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Detail Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <span className="text-indigo-600 text-xl">👤</span> Admin Detail
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Primary Contact */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Primary Contact Name <span className="text-indigo-600">*</span></label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Full legal name" className={getInputClass('contactName')} />
                {errors.contactName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.contactName}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Business Email / User ID <span className="text-indigo-600">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="admin@company.com" className={getInputClass('email')} />
                {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Mobile Phone <span className="text-indigo-600">*</span></label>
                <div className="flex">
                  <span className={`border border-r-0 rounded-l-lg px-3 py-2.5 text-sm font-medium transition-colors ${errors.mobile ? 'bg-red-50 border-red-400 text-red-600' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>+1</span>
                  <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="000-000-0000" className={`w-full bg-gray-50 border rounded-r-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${errors.mobile ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-indigo-500 focus:bg-white'}`} />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mobile}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Forms) */}
        <div className="col-span-1 space-y-6">
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <span className="text-indigo-600">⚙️</span> Account Detail
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Account Type</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'PAID POC'})}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-colors ${formData.accountType === 'PAID POC' ? 'border-2 border-indigo-600 text-indigo-700 bg-indigo-50' : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                  >
                    PAID POC
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, accountType: 'ENTERPRISE'})}
                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-colors ${formData.accountType === 'ENTERPRISE' ? 'border-2 border-indigo-600 text-indigo-700 bg-indigo-50' : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                  >
                    ENTERPRISE
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">License Period</label>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs">📅</span>
                    <input type="text" name="start" value={formData.start} onChange={handleChange} placeholder="Start Date (e.g. Jan 01)" className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-xs">📅</span>
                    <input type="text" name="end" value={formData.end} onChange={handleChange} placeholder="End Date (e.g. Dec 31)" className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-8 border-t-2 border-indigo-500 pt-6">
        <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="text-gray-400">ℹ️</span> Please ensure all administrative contact details are verified before submission.
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/admin/companies')}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 transition"
            >
              Discard
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[#4338ca] transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
              {loading ? 'Finalizing...' : 'Finalize Registration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;