import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Gọi API Login
            const response = await axiosClient.post('/admin/users/login', values);
            
            // Backend trả về: { token: "...", fullName: "...", role: "..." }
            message.success('Đăng nhập thành công!');
            
            // Lưu dữ liệu quan trọng vào trình duyệt
            localStorage.setItem('access_token', response.token);
            localStorage.setItem('user_info', JSON.stringify({
                fullName: response.fullName,
                role: response.role,
                username: response.username
            }));

            // Chuyển sang trang Dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error("Login Error:", error);
            message.error('Đăng nhập thất bại! Kiểm tra lại tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
        }}>
            <Card style={{ width: 400, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>Admin Panel</Title>
                    <Text type="secondary">Đăng nhập hệ thống Loyalty</Text>
                </div>

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;