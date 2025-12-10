import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { TrophyOutlined } from '@ant-design/icons'; // Import icon
import { RocketOutlined } from '@ant-design/icons';
import { 
    UserOutlined, 
    VideoCameraOutlined, 
    GiftOutlined, 
    LogoutOutlined,
    DashboardOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const user = JSON.parse(localStorage.getItem('user_info'));

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        navigate('/');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={[location.pathname]} // Tự động sáng menu dựa trên link hiện tại
                    onClick={(item) => navigate(item.key)} // Chuyển trang dựa trên key
                    items={[
                        { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
                        { key: '/customers', icon: <UserOutlined />, label: 'Khách hàng' },
                        // Các mục sau này làm thêm thì bỏ comment
                        { key: '/transactions', icon: <VideoCameraOutlined />, label: 'Giao dịch' },
                        { key: '/rewards', icon: <GiftOutlined />, label: 'Phần quà' },
                        { key: '/redemptions', icon: <GiftOutlined />, label: 'Đổi quà' },
                        { key: '/tiers', icon: <TrophyOutlined />, label: 'Hạng thành viên' },
                        { key: '/promotions', icon: <RocketOutlined />, label: 'Khuyến mãi' },
                    ]} 
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Xin chào, {user?.fullName || 'Admin'}</h3>
                    <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                    {/* Đây là nơi nội dung thay đổi (Dashboard hoặc Customer sẽ hiện ở đây) */}
                    <Outlet /> 
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;