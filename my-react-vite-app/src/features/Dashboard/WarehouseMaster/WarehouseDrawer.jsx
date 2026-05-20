import React, { useState, useEffect } from 'react';

const WarehouseDrawer = ({ isOpen, onClose, mode, warehouse, onSave, isSaving }) => {
  const [formData, setFormData] = useState({});

  // Reset form when drawer opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData(mode === 'edit' && warehouse ? { ...warehouse } : {
        name: '', location: '', type: 'HUB', capacity: '', status: 'Operational', manager: ''
      });
    }
  }, [isOpen, mode, warehouse]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      
      {/* Right Slide-out Drawer */}
      <div className="fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-lg">
            {mode === 'edit' ? `Edit Warehouse: ${warehouse?.name}` : 'Create New Warehouse'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors">✕</button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Image Placeholder */}
          <div className="w-full h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
            <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center text-indigo-600 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-md shadow-sm">Upload Photo</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Warehouse Name</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g. Phoenix Logistics Center" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Location / Address</label>
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Street, City, State, ZIP" className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
              <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]">
                <option value="HUB">Hub</option>
                <option value="DC">Distribution Center</option>
                <option value="REGIONAL">Regional Annex</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Capacity (m³)</label>
              <input type="number" name="capacity" value={formData.capacity || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assigned Manager</label>
            <select name="manager" value={formData.manager || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]">
              <option value="">Select a manager...</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="David Chen">David Chen</option>
              <option value="Lisa Ray">Lisa Ray</option>
              <option value="Marcus Thorne">Marcus Thorne</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <div className="flex gap-3">
              <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center text-xs font-bold transition-colors ${formData.status === 'Operational' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="Operational" checked={formData.status === 'Operational'} onChange={handleChange} className="hidden" />
                Operational
              </label>
              <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center text-xs font-bold transition-colors ${formData.status === 'Maintenance' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="Maintenance" checked={formData.status === 'Maintenance'} onChange={handleChange} className="hidden" />
                Maintenance
              </label>
              <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center text-xs font-bold transition-colors ${formData.status === 'Inactive' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={handleChange} className="hidden" />
                Inactive
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-[#4f46e5] hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50">
            {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Warehouse' : 'Create Warehouse'}
          </button>
        </div>
      </div>
    </>
  );
};

export default WarehouseDrawer;