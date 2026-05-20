import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMaterials, updateMaterial, deleteMaterial } from '../dashboard.service';

// Import our isolated Modal components
import EditMaterialModal from './EditMaterialModal';
import DeleteMaterialModal from './DeleteMaterialModal';

const MaterialMaster = () => {
  const navigate = useNavigate();
  
  // --- Data State ---
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Feature State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Modal States ---
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMat, setEditingMat] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [matToDelete, setMatToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchMaterials();
    setMaterials(data);
    setLoading(false);
  };

  // --- Modal Handlers ---
  const handleSaveEdit = async (updatedData) => {
    setIsSaving(true);
    await updateMaterial(updatedData.id, updatedData);
    setIsEditOpen(false);
    setIsSaving(false);
    loadData();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await deleteMaterial(matToDelete.id);
    setIsDeleteOpen(false);
    setIsDeleting(false);
    loadData();
  };

  // --- Derived State (Filtering & Pagination) ---
  const filteredMaterials = materials.filter(mat => 
    mat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-7xl mx-auto w-full font-sans flex flex-col h-full pb-6 relative">
      
      {/* Mounted Modals */}
      <EditMaterialModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        material={editingMat} 
        onSave={handleSaveEdit} 
        isSaving={isSaving} 
      />
      
      <DeleteMaterialModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        material={matToDelete} 
        onConfirm={confirmDelete} 
        isDeleting={isDeleting} 
      />

      {/* Header Area */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Material Master</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
            Centralized repository for managing enterprise product resources. View, filter, and modify global material definitions across all sales regions and manufacturing groups.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard/bulk-upload')} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Bulk Upload
          </button>
          <button onClick={() => navigate('/dashboard/create-material')} className="px-5 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
            <span>+</span> Create Material
          </button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col mb-6">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-[400px]">
            <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Filter by Material ID or Product Name..." className="w-full bg-gray-50 border-none rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-700 bg-gray-50/50">
                <th className="p-4 pl-6 font-bold w-32">Product ID</th>
                <th className="p-4 font-bold">Product Description</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Group</th>
                <th className="p-4 font-bold">Sales Region</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">Loading materials...</td></tr>
              ) : paginatedMaterials.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">No materials found.</td></tr>
              ) : (
                paginatedMaterials.map((mat, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-indigo-600 text-xs tracking-wide">{mat.id}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 opacity-80"></div>
                      </div>
                      <span className="font-bold text-gray-900 leading-tight">{mat.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{mat.type}</td>
                    <td className="p-4 text-gray-600">{mat.group}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {mat.regions.map(r => (
                          <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${r === 'GLOBAL' ? 'bg-teal-100 text-teal-800' : r === 'EMEA' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        mat.status === 'Active' ? 'text-green-700 bg-white' : 
                        mat.status === 'Pending Review' ? 'text-amber-700 bg-amber-50' : 
                        mat.status === 'Draft' ? 'text-gray-700 bg-white' :
                        mat.status === 'Discontinued' ? 'text-red-700 bg-white' : 'text-gray-500 bg-gray-50'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${mat.status === 'Active' ? 'bg-green-500' : mat.status === 'Pending Review' ? 'bg-amber-500' : mat.status === 'Discontinued' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                        {mat.status}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <button 
                          onClick={() => { setEditingMat(mat); setIsEditOpen(true); }} 
                          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded transition-colors group relative"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        
                        <button 
                          onClick={() => { setMatToDelete(mat); setIsDeleteOpen(true); }} 
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination */}
        {!loading && filteredMaterials.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/30 rounded-b-xl">
            <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMaterials.length)} of {filteredMaterials.length} entries</span>
            <div className="flex gap-1 items-center">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">&lt;</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => goToPage(page)} className={`px-3 py-1 rounded font-medium shadow-sm transition-colors ${currentPage === page ? 'bg-[#4f46e5] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>{page}</button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 text-gray-700 hover:text-gray-900 font-bold disabled:opacity-50">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialMaster;