import React, { useState, useEffect } from 'react';

const EditMaterialModal = ({ isOpen, onClose, material, onSave, isSaving }) => {
  // Local state to handle form edits
  const [formData, setFormData] = useState(material || {});

  // Update local state if the selected material changes
  useEffect(() => {
    if (material) setFormData({ ...material });
  }, [material]);

  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="font-bold text-gray-900 text-lg">Edit Material</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors">✕</button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product ID (Read Only)</label>
            <input type="text" disabled value={formData.id || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type</label>
              <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]">
                <option value="Hardware">Hardware</option>
                <option value="Electronics">Electronics</option>
                <option value="Processor">Processor</option>
                <option value="Module">Module</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button onClick={() => onSave(formData)} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-white bg-[#4f46e5] hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialModal;