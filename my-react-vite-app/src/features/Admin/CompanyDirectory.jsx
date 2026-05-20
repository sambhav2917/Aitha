import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCompanies } from './admin.service';

const CompanyDirectory = () => {
  const navigate = useNavigate();
  
  // --- Data State ---
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter & Pagination State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust this to show more rows per page

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Derived State (Calculated on every render) ---
  const filteredCompanies = companies.filter(co => 
    co.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    co.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    co.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // --- Handlers ---
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Always jump back to page 1 when searching
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-6 font-sans">
      {/* Breadcrumb & Title Area */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Console <span className="mx-1">&gt;</span> <span className="text-indigo-600">Company Management</span></p>
          <h2 className="text-2xl font-bold text-gray-900">Company Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Oversee and manage multi-tenant instance registrations and licensing lifecycles.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/register-company')} className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-[#4338ca]">
            <span>+</span> Register New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 font-bold text-lg">🏢</div>
          <p className="text-sm font-medium text-gray-500">Total Companies</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{companies.length}</p>
          <span className="absolute top-5 right-5 text-xs font-bold text-green-600">+2.5%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 font-bold text-lg">✓</div>
          <p className="text-sm font-medium text-gray-500">Active Licenses</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {companies.filter(c => c.statusActive).length}
          </p>
          <span className="absolute top-5 right-5 text-xs font-semibold text-gray-500">Steady</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 font-bold text-lg">⏱</div>
          <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
          <span className="absolute top-5 right-5 text-xs font-bold text-red-500">-4.2%</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3 font-bold text-lg">✕</div>
          <p className="text-sm font-medium text-gray-500">Non-Active</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {companies.filter(c => !c.statusActive).length}
          </p>
          <span className="absolute top-5 right-5 text-xs font-bold text-red-500">Alerts</span>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Header with Search */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Entity Records</h3>
          <div className="relative w-72">
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Name, ID, or Type..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow" 
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">Loading companies...</div>
        ) : paginatedCompanies.length === 0 ? (
          <div className="p-10 text-center text-gray-500 font-medium">No companies found matching "{searchQuery}"</div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 bg-white">
                  <th className="p-4 font-bold">Account Type</th>
                  <th className="p-4 font-bold">Company Name</th>
                  <th className="p-4 font-bold">State</th>
                  <th className="p-4 font-bold">Country</th>
                  <th className="p-4 font-bold">Contact Person</th>
                  <th className="p-4 font-bold">Mobile</th>
                  <th className="p-4 font-bold">User ID</th>
                  <th className="p-4 font-bold">Start Date</th>
                  <th className="p-4 font-bold">End Date</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginatedCompanies.map((co, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${co.typeColor}`}>{co.type}</span></td>
                    <td className="p-4 font-bold text-gray-900">{co.name}</td>
                    <td className="p-4 text-gray-600">{co.state}</td>
                    <td className="p-4 text-gray-600">{co.country}</td>
                    <td className="p-4 text-gray-600">{co.contact}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">{co.mobile}</td>
                    <td className="p-4 text-gray-500">{co.id}</td>
                    <td className="p-4 text-gray-600">{co.start}</td>
                    <td className={`p-4 font-medium ${co.redEnd ? 'text-red-600' : 'text-gray-600'}`}>{co.end}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 w-max px-3 py-1 rounded-md text-xs font-bold border ${co.statusActive ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        {co.status}
                        <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination Footer */}
        {!loading && filteredCompanies.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-white">
            <span>
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
            </span>
            <div className="flex gap-1 items-center">
              <button 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                &lt;
              </button>
              
              {/* Dynamically Generate Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    currentPage === page 
                      ? 'bg-[#4f46e5] text-white shadow-sm' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDirectory;