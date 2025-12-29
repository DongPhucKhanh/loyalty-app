import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Tag } from 'antd';
import { 
    TrophyOutlined, RocketOutlined, UserOutlined, 
    VideoCameraOutlined, GiftOutlined, LogoutOutlined,
    DashboardOutlined, SafetyCertificateOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy thông tin user và role
    const user = JSON.parse(localStorage.getItem('user_info')) || {};
    const role = user?.role || 'STAFF'; // Mặc định là STAFF nếu không tìm thấy

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // --- ĐỊNH NGHĨA DANH SÁCH MENU ĐẦY ĐỦ ---
    const allMenuItems = [
          { 
            key: '/dashboard', 
            icon: <DashboardOutlined />, 
            label: 'Tổng quan (Dashboard)',
            roles: ['ADMIN'] // Staff không cần xem doanh thu tổng
        },
        // 1. Nhóm Dành cho cả Admin & Staff (Nghiệp vụ hàng ngày)
        { 
            key: '/customers', 
            icon: <UserOutlined />, 
            label: 'Khách hàng (Tìm & Tra cứu)',
            roles: ['ADMIN', 'STAFF'] 
        },
        { 
            key: '/transactions', 
            icon: <VideoCameraOutlined />, 
            label: 'Tích điểm (Giao dịch)',
            roles: ['ADMIN', 'STAFF'] 
        },
        { 
            key: '/redemptions', // Bạn kiểm tra lại route bên App.jsx là redemption hay redemptions nhé
            icon: <GiftOutlined />, 
            label: 'Đổi quà',
            roles: ['ADMIN', 'STAFF'] 
        },

        // 2. Nhóm Chỉ dành cho Admin (Quản lý & Cấu hình)
      
        { 
            key: '/rewards', 
            icon: <GiftOutlined />, 
            label: 'Kho quà tặng',
            roles: ['ADMIN'] // Admin nhập kho, Staff chỉ đổi
        },
        { 
            key: '/tiers', 
            icon: <TrophyOutlined />, 
            label: 'Cấu hình Hạng',
            roles: ['ADMIN'] 
        },
        { 
            key: '/promotions', 
            icon: <RocketOutlined />, 
            label: 'Cấu hình Khuyến mãi',
            roles: ['ADMIN'] 
        },
        { 
            key: '/employees', 
            icon: <TeamOutlined />, 
            label: 'Quản lý Nhân viên',
            roles: ['ADMIN'] 
        },
        { 
            key: '/audit-logs', 
            icon: <SafetyCertificateOutlined />, 
            label: 'Nhật ký hệ thống',
            roles: ['ADMIN'] 
        },
    ];

    // --- LỌC MENU THEO QUYỀN ---
    const menuItems = allMenuItems.filter(item => item.roles.includes(role));

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={[location.pathname]} 
                    onClick={(item) => navigate(item.key)} 
                    items={menuItems} // Chỉ hiện menu đã lọc
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 style={{ margin: 0 }}>Xin chào, {user.fullName || user.username}</h3>
                        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'NHÂN VIÊN'}</Tag>
                    </div>
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    <Outlet /> 
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;