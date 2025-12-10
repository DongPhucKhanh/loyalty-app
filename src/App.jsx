import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomerPage from './pages/CustomerPage';
import MainLayout from './components/MainLayout'; // Import Layout mới
import RewardPage from './pages/RewardPage';
import TransactionPage from './pages/TransactionPage';
import RedemptionPage from './pages/RedemptionPage';
import TierPage from './pages/TierPage'; // Import
import PromotionPage from './pages/PromotionPage';
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* BỌC CÁC TRANG ADMIN TRONG MAINLAYOUT */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomerPage />} />
            <Route path="/rewards" element={<RewardPage />} /> {/* Thêm dòng này */}
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/redemptions" element={<RedemptionPage />} />
            <Route path="/tiers" element={<TierPage />} />
            <Route path="/promotions" element={<PromotionPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;