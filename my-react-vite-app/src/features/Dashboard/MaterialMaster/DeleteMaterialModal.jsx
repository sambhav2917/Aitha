import React from 'react';

const DeleteMaterialModal = ({ isOpen, onClose, material, onConfirm, isDeleting }) => {
  if (!isOpen || !material) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[450px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center pt-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Discontinue Material?</h3>
          <p className="text-sm text-gray-500 leading-relaxed px-4">
            Are you sure you want to mark <strong className="text-gray-900">{material.id} ({material.name})</strong> as discontinued? It will no longer be available for new sales pipelines.
          </p>
        </div>
        <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex justify-center gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Keep Active</button>
          <button onClick={onConfirm} disabled={isDeleting} className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
            {isDeleting ? 'Discontinuing...' : 'Yes, Discontinue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMaterialModal;