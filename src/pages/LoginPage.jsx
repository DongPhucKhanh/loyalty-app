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
            const response = await axiosClient.post('/auth/login', values);
            console.log("DỮ LIỆU BACKEND TRẢ VỀ:", response); 

            const data = response.data ? response.data : response;

            if (!data || !data.role) {
                message.error("Lỗi: Backend không trả về Role!");
                return;
            }

            message.success('Đăng nhập thành công!');
            localStorage.setItem('access_token', data.token || '');
            localStorage.setItem('user_info', JSON.stringify(data));

            setTimeout(() => {
                if (data.role === 'ADMIN') {
                    navigate('/dashboard'); 
                } else if (data.role === 'STAFF') {
                    navigate('/customers'); 
                } else {
                    message.warning("Tài khoản không có quyền truy cập!");
                }
            }, 500);

        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            message.error('Sai tên đăng nhập hoặc mật khẩu!');
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
                    <Title level={2} style={{ margin: 0 }}>Hệ thống Loyalty</Title>
                    <Text type="secondary">Đăng nhập để làm việc</Text>
                </div>

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    // --- ĐÂY LÀ PHẦN THÊM VÀO ĐỂ GÁN TÀI KHOẢN CỨNG ---
                    initialValues={{
                        username: 'admin',
                        password: 'admin123'
                    }}
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

                    {/* Thêm ghi chú cho giáo viên */}
                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <Text type="secondary" italic size="small">
                            * Tài khoản test đã được điền sẵn
                        </Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;