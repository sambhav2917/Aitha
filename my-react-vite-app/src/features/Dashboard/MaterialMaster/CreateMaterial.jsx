import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMaterial } from '../dashboard.service';

const CreateMaterial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    description: '',
    type: 'Hardware',
    group: '',
    region: 'GLOBAL',
    oldProductId: '',
    isPlannable: true
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.description) {
      alert("Please fill in the Product ID and Description.");
      return;
    }

    setLoading(true);
    try {
      await createMaterial(formData);
      navigate('/dashboard/materials'); // Redirects back to dashboard
    } catch (error) {
      console.error("Failed to create material", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard/materials')}>Console</span> 
            <span className="mx-1">&gt;</span> 
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard/materials')}>Material Master</span> 
            <span className="mx-1">&gt;</span> 
            <span className="text-indigo-600">Create Material</span>
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Create New Material</h2>
          <p className="text-sm text-gray-500 mt-1">Define a new product or component in the enterprise repository.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/dashboard/materials')}
            className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#4338ca] disabled:opacity-50"
          >
            <span>{loading ? '⏳' : '💾'}</span> {loading ? 'Saving...' : 'Save Material'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-indigo-600">📦</span> Core Attributes
              </h3>
              <span className="text-xs font-bold text-indigo-600">* Required Fields</span>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Product ID <span className="text-indigo-600">*</span></label>
                  <input type="text" name="productId" value={formData.productId} onChange={handleChange} placeholder="e.g. MAT-12345" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Old Product ID</label>
                  <input type="text" name="oldProductId" value={formData.oldProductId} onChange={handleChange} placeholder="Legacy system ID" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Product Description <span className="text-indigo-600">*</span></label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Full product name or description" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Type <span className="text-indigo-600">*</span></label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white">
                    <option value="Hardware">Hardware</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Processor">Processor</option>
                    <option value="Module">Module</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Group</label>
                  <input type="text" name="group" value={formData.group} onChange={handleChange} placeholder="e.g. Core Tech, Network" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Settings) */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <span className="text-indigo-600">⚙️</span> Planning Details
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Sales Region <span className="text-indigo-600">*</span></label>
                <select name="region" value={formData.region} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:bg-white">
                  <option value="GLOBAL">GLOBAL</option>
                  <option value="NORTHAM">NORTHAM</option>
                  <option value="EMEA">EMEA</option>
                  <option value="APAC">APAC</option>
                  <option value="LATAM">LATAM</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-800">Is Plannable?</span>
                <div 
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${formData.isPlannable ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  onClick={() => setFormData({...formData, isPlannable: !formData.isPlannable})}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.isPlannable ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterial;