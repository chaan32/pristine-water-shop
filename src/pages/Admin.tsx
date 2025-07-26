import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductManagement from '@/components/Admin/ProductManagement';
import ProductEdit from '@/components/Admin/ProductEdit';
import SalesChart from '@/components/Admin/SalesChart';
import MemberList from '@/components/Admin/MemberList';
import CorporateRequests from '@/components/Admin/CorporateRequests';
import InquiryManagement from '@/components/Admin/InquiryManagement';

const Admin = () => {
  // 임시로 관리자 로그인 상태 체크 - 나중에 실제 인증 로직으로 대체
  const [isAdmin] = useState(true); // 실제로는 로그인 상태에서 가져와야 함
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/products" replace />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/products/edit/:id?" element={<ProductEdit />} />
        <Route path="/sales" element={<SalesChart />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/corporate-requests" element={<CorporateRequests />} />
        <Route path="/inquiries" element={<InquiryManagement />} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin;