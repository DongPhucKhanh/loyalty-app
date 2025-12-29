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
            
            // --- IN RA MÀN HÌNH CONSOLE ĐỂ KIỂM TRA ---
            console.log("DỮ LIỆU BACKEND TRẢ VỀ:", response); 

            // Kiểm tra xem dữ liệu nằm ở 'response' hay 'response.data'
            // Một số cấu hình axios sẽ trả về trực tiếp data, một số trả về full response
            const data = response.data ? response.data : response;

            if (!data || !data.role) {
                message.error("Lỗi: Backend không trả về Role!");
                console.error("Thiếu role trong data:", data);
                return;
            }

            message.success('Đăng nhập thành công!');
            
            // Lưu vào localStorage
            localStorage.setItem('access_token', data.token || ''); // Lưu token nếu có
            localStorage.setItem('user_info', JSON.stringify(data));

            // --- PHÂN LUỒNG ---
            // Thêm độ trễ nhỏ 0.5s để đảm bảo localStorage kịp lưu
            setTimeout(() => {
                if (data.role === 'ADMIN') {
                    console.log("Đang chuyển hướng đến Dashboard...");
                    navigate('/dashboard'); 
                } else if (data.role === 'STAFF') {
                    console.log("Đang chuyển hướng đến Khách hàng...");
                    navigate('/customers'); 
                } else {
                    message.warning("Tài khoản không có quyền truy cập!");
                }
            }, 500);

        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            message.error('Đăng nhập thất bại!');
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