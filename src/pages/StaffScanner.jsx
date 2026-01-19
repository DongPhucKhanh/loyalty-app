import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card, Button, Typography, message, Descriptions, InputNumber, Divider } from 'antd';
import { QrcodeOutlined, UserOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const StaffScanner = () => {
    const [customer, setCustomer] = useState(null);
    const [billAmount, setBillAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Chỉ khởi tạo scanner khi chưa có thông tin khách hàng (đang ở màn hình quét)
        if (!customer) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            });

            scanner.render(onScanSuccess, onScanFailure);

            function onScanSuccess(decodedText) {
                // Định dạng mã QR: "CUSTOMER_ID:1"
                if (decodedText.startsWith("CUSTOMER_ID:")) {
                    const customerId = decodedText.split(":")[1];
                    fetchCustomerInfo(customerId);
                    scanner.clear(); // Tắt camera sau khi quét trúng
                } else {
                    message.error("Mã QR không hợp lệ. Vui lòng quét mã thành viên!");
                }
            }

            function onScanFailure(error) { /* Bỏ qua lỗi khi đang tìm mã */ }

            return () => {
                scanner.clear().catch(err => console.error("Lỗi đóng scanner:", err));
            };
        }
    }, [customer]);

    // Lấy thông tin khách hàng từ Backend
    const fetchCustomerInfo = async (id) => {
        const hide = message.loading('Đang tải thông tin khách hàng...', 0);
        try {
            const data = await axiosClient.get(`/user/profile-summary?id=${id}`);
            setCustomer(data);
            hide();
        } catch (error) {
            hide();
            message.error("Không tìm thấy khách hàng này trên hệ thống!");
            // Reset về màn hình quét nếu lỗi
            setCustomer(null);
        }
    };

    // Xử lý tích điểm 1% doanh thu
    const handleAddPoints = async () => {
        if (!billAmount || billAmount <= 0) {
            return message.warning("Vui lòng nhập số tiền thanh toán hợp lệ!");
        }

        const hide = message.loading('Đang xử lý tích điểm...', 0);
        setLoading(true);

        try {
            // Gửi yêu cầu lên TransactionController
            await axiosClient.post('/transactions/add', {
                customerId: customer.id,
                amount: billAmount
            });

            hide();
            // HIỂN THỊ THÔNG BÁO THÀNH CÔNG (Không bị mất vì không dùng reload)
            message.success({
                content: `Tích điểm thành công cho ${customer.name}!`,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                duration: 4
            });

            // Reset tất cả state về mặc định để quét khách tiếp theo
            setCustomer(null);
            setBillAmount(0);

        } catch (error) {
            hide();
            console.error("Lỗi tích điểm:", error);
            message.error(error.response?.data || "Giao dịch thất bại, vui lòng kiểm tra lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
            <Card 
                title={
                    <span>
                        <QrcodeOutlined /> {customer ? "Xác nhận tích điểm" : "Quét mã thành viên"}
                    </span>
                }
                bordered={false}
                style={{ borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                {!customer ? (
                    <div style={{ textAlign: 'center' }}>
                        <div id="reader" style={{ borderRadius: 12, overflow: 'hidden' }}></div>
                        <div style={{ marginTop: 20 }}>
                            <Text type="secondary">Hướng camera vào mã QR trên ứng dụng của khách hàng</Text>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in">
                        <Descriptions 
                            title={<Text strong><UserOutlined /> Thông tin khách hàng</Text>} 
                            bordered 
                            column={1}
                            size="small"
                        >
                            <Descriptions.Item label="Họ tên"><b>{customer.name}</b></Descriptions.Item>
                            <Descriptions.Item label="Hạng">{customer.currentTier}</Descriptions.Item>
                            <Descriptions.Item label="Điểm hiện có">{(customer.points || 0).toLocaleString()} điểm</Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <div style={{ marginTop: 10 }}>
                            <Text strong>Tổng hóa đơn thanh toán (VNĐ):</Text>
                            <InputNumber
                                autoFocus
                                style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
                                size="large"
                                min={0}
                                placeholder="Ví dụ: 500,000"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={(value) => setBillAmount(value)}
                            />
                            
                            <div style={{ background: '#f0f5ff', padding: '15px', borderRadius: 12, marginBottom: 20, border: '1px dashed #1890ff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text type="secondary">Điểm tích lũy (1%):</Text>
                                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                        +{(billAmount * 0.01).toLocaleString()} <small style={{ fontSize: '14px' }}>điểm</small>
                                    </Title>
                                </div>
                            </div>

                            <Button 
                                type="primary" 
                                size="large" 
                                block 
                                onClick={handleAddPoints} 
                                loading={loading}
                                style={{ height: 50, borderRadius: 10, fontWeight: 'bold' }}
                            >
                                XÁC NHẬN TÍCH ĐIỂM
                            </Button>
                            
                            <Button 
                                type="link" 
                                block 
                                style={{ marginTop: 12 }} 
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setCustomer(null)}
                            >
                                Hủy và quét lại
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default StaffScanner;