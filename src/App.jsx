import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';

// Import các trang
import DashboardPage from './pages/DashboardPage';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import TransactionPage from './pages/TransactionPage';
import RedemptionPage from './pages/RedemptionPage';
import RewardPage from './pages/RewardPage';
import TierPage from './pages/TierPage';
import PromotionPage from './pages/PromotionPage';
import AuditLogPage from './pages/AuditLogPage';
import EmployeeHistoryPage from './pages/EmployeeHistoryPage';
import StaffScanner from './pages/StaffScanner'; // Import file vừa tạo

// --- 1. COMPONENT BẢO VỆ: ĐĂNG NHẬP MỚI ĐƯỢC VÀO ---
// Sửa đổi: Kiểm tra 'user_info' thay vì 'access_token' để tránh lỗi khi chưa có token
const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user_info');
    return user ? children : <Navigate to="/" replace />;
};

// --- 2. COMPONENT BẢO VỆ: CHỈ ADMIN MỚI ĐƯỢC VÀO ---
const AdminRoute = ({ children }) => {
    const userString = localStorage.getItem('user_info');
    const user = userString ? JSON.parse(userString) : null;

    // Nếu không phải ADMIN, đá về trang bán hàng của nhân viên
    if (user && user.role !== 'ADMIN') {
        return <Navigate to="/customers" replace />;
    }
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Login (Mặc định) */}
        <Route path="/" element={<LoginPage />} />

        {/* Bọc toàn bộ các trang nội bộ trong Layout & PrivateRoute */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            
            {/* --- NHÓM 1: TRANG CHUNG (Admin & Staff đều vào được) --- */}
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/redemptions" element={<RedemptionPage />} />

            {/* --- NHÓM 2: TRANG QUẢN TRỊ (Chỉ Admin vào được) --- */}
            {/* Nếu Staff cố tình gõ link này sẽ bị đá về /customers */}
            <Route path="/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
            <Route path="/employees" element={<AdminRoute><EmployeePage /></AdminRoute>} />
            <Route path="/rewards" element={<AdminRoute><RewardPage /></AdminRoute>} />
            <Route path="/tiers" element={<AdminRoute><TierPage /></AdminRoute>} />
            <Route path="/promotions" element={<AdminRoute><PromotionPage /></AdminRoute>} />
            <Route path="/audit-logs" element={<AdminRoute><AuditLogPage /></AdminRoute>} />
            <Route path="/my-history" element={<EmployeeHistoryPage />} />
            <Route path="/staff/scanner" element={<StaffScanner />} />
            
        </Route>

        {/* Nếu đường dẫn sai -> Về trang Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;