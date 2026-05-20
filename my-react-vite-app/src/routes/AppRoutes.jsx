import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from '@/features/Auth/Login';
import TwoFactorAuth from '@/features/Auth/TwoFactorAuth';

// Admin Domain
import AdminLayout from '@/features/Admin/AdminLayout'; 
import CompanyDirectory from '@/features/Admin/CompanyDirectory';
import RegisterCompany from '@/features/Admin/RegisterCompany';
import Licenses from '@/features/Admin/Licenses';
import AuditLogs from '@/features/Admin/AuditLogs';

// Dashboard / Sales Domain
import DashboardLayout from '@/features/Dashboard/DashboardLayout';
import MaterialMaster from '@/features/Dashboard/MaterialMaster/MaterialMaster';
import BulkUpload from '@/features/Dashboard/MaterialMaster/BulkUpload';
import CreateMaterial from '@/features/Dashboard/MaterialMaster/CreateMaterial';
import SalesRegions from '@/features/Dashboard/SalesRegions/SalesRegions';
import Forecasting from '@/features/Dashboard/Forecasting/Forecasting';
import WarehouseMaster from '@/features/Dashboard/WarehouseMaster/WarehouseMaster';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/2fa" element={<TwoFactorAuth />} />
        
        {/* DOMAIN 1: Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="companies" replace />} /> 
          <Route path="companies" element={<CompanyDirectory />} />
          <Route path="register-company" element={<RegisterCompany />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>

        {/* DOMAIN 2: Enterprise Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="materials" replace />} /> 
          <Route path="materials" element={<MaterialMaster />} />
          <Route path="bulk-upload" element={<BulkUpload />} />
          <Route path="create-material" element={<CreateMaterial />} />
          <Route path="regions" element={<SalesRegions />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="warehouse" element={<WarehouseMaster />} />
        </Route>

        <Route path="*" element={<div className="p-10 font-bold">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;