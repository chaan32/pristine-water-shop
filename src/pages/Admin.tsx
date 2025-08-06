import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductManagement from '@/components/Admin/ProductManagement';
import ProductEdit from '@/components/Admin/ProductEdit';
import ProductContentManagement from '@/components/Admin/ProductContentManagement';
import SalesChart from '@/components/Admin/SalesChart';
import MemberList from '@/components/Admin/MemberList';
import CorporateRequests from '@/components/Admin/CorporateRequests';
import InquiryManagement from '@/components/Admin/InquiryManagement';
import RefundExchangeManagement from '@/components/Admin/RefundExchangeManagement';

const Admin = () => {
  // 임시로 인증 체크 비활성화
  // const userType = localStorage.getItem('userType');
  // const accessToken = localStorage.getItem('accessToken');
  
  // if (!accessToken || userType !== 'admin') {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/products" replace />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/products/edit/:id?" element={<ProductEdit />} />
        <Route path="/products/content" element={<ProductContentManagement />} />
        <Route path="/sales" element={<SalesChart />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/corporate-requests" element={<CorporateRequests />} />
        <Route path="/inquiries" element={<InquiryManagement />} />
        <Route path="/refund-exchange" element={<RefundExchangeManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;