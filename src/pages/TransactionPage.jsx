import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, message, Tag, Card, Divider, Alert, Space, Typography } from 'antd';
import { 
    PlusOutlined, ShoppingCartOutlined, GiftOutlined, UserOutlined, 
    CalculatorOutlined, SwapOutlined, HistoryOutlined
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Text } = Typography;
const { Option } = Select;

const TransactionPage = () => {
    // --- STATE DỮ LIỆU ---
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- STATE SẮP XẾP (MỚI) ---
    const [sortOrder, setSortOrder] = useState('newest'); // Mặc định: Mới nhất trước

    // --- STATE TẠO GIAO DỊCH (POS) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [redemptions, setRedemptions] = useState([]); 
    const [selectedRedemption, setSelectedRedemption] = useState(null); 
    const [form] = Form.useForm();
    const billAmount = Form.useWatch('amount', form) || 0;

    // 1. TẢI DỮ LIỆU CHUNG
    const fetchData = async () => {
        setLoading(true);
        try {
            const [transData, custData] = await Promise.all([
                axiosClient.get('/transactions'),
                axiosClient.get('/customers')
            ]);
            // Đảm bảo data là mảng
            setTransactions(Array.isArray(transData) ? transData : []);
            setCustomers(Array.isArray(custData) ? custData : []);
        } catch (error) {
            message.error('Lỗi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. LOGIC SẮP XẾP (MỚI)
    const getSortedTransactions = () => {
        const sortedData = [...transactions];
        sortedData.sort((a, b) => {
            const dateA = new Date(a.transactionDate).getTime();
            const dateB = new Date(b.transactionDate).getTime();
            
            if (sortOrder === 'newest') {
                return dateB - dateA; // Mới nhất lên đầu
            } else {
                return dateA - dateB; // Cũ nhất lên đầu
            }
        });
        return sortedData;
    };

    // 3. LOGIC POS: CHỌN KHÁCH -> LOAD VOUCHER
    const handleCustomerChange = async (customerId) => {
        setSelectedRedemption(null);
        form.setFieldValue('redemptionId', null); 
        try {
            const data = await axiosClient.get(`/redemptions/available-to-use?customerId=${customerId}`);
            setRedemptions(data);
        } catch (error) {
            setRedemptions([]);
        }
    };

    // 4. LOGIC POS: TÍNH TIỀN REALTIME
    const calculateFinal = () => {
        let disc = 0;
        let finalAmount = billAmount;

        // Tính giảm giá
        if (selectedRedemption) {
            const reward = selectedRedemption.reward;
            if (reward.discountValue > 100) {
                disc = reward.discountValue; // Giảm tiền mặt
            } else {
                disc = billAmount * (reward.discountValue / 100); // Giảm phần trăm
            }
        }
        
        if (disc > billAmount) disc = billAmount;
        finalAmount = billAmount - disc;

        // Tính điểm (100đ = 1 điểm, ví dụ)
        const earned = Math.floor(billAmount * 0.01);

        return { 
            discount: Math.round(disc), 
            final: Math.round(finalAmount), 
            earned: earned 
        };
    };

    const { discount, final, earned } = calculateFinal();

    // 5. LOGIC POS: SUBMIT
    const handleCreateTransaction = async (values) => {
        if (!values.amount || values.amount <= 0) {
            message.error('Vui lòng nhập số tiền hợp lệ!');
            return;
        }

        try {
            const redemId = selectedRedemption ? selectedRedemption.id : null;
            // Gửi API (Giữ nguyên logic query params của bạn)
            const query = `customerId=${values.customerId}&amount=${values.amount}${redemId ? `&redemptionId=${redemId}` : ''}`;
            
            await axiosClient.post(`/transactions/add-points?${query}`);
            
            message.success('Giao dịch thành công!');
            setIsModalOpen(false);
            form.resetFields();
            setSelectedRedemption(null);
            fetchData(); // Tải lại danh sách
        } catch (error) {
            message.error('Giao dịch thất bại!');
        }
    };

    // 6. CẤU HÌNH CỘT BẢNG
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
        { 
            title: 'Khách hàng', 
            dataIndex: ['customer', 'name'], 
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer?.phone}</Text>
                </Space>
            )
        },
        { 
            title: 'Hóa đơn gốc', 
            dataIndex: 'totalAmount', 
            align: 'right',
            render: (val) => `${val?.toLocaleString()}đ`
        },
        { 
            title: 'Giảm giá', 
            dataIndex: 'discountAmount', 
            align: 'right',
            render: (val) => val > 0 ? <Tag color="red">-{val?.toLocaleString()}đ</Tag> : '-'
        },
        { 
            title: 'Thực thu', 
            dataIndex: 'finalAmount', 
            align: 'right',
            render: (val) => <Text strong type="success">{val?.toLocaleString()}đ</Text>
        },
        { 
            title: 'Điểm', 
            key: 'points',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tag color="green" icon={<PlusOutlined />}>{record.pointsEarned}</Tag>
                </Space>
            )
        },
        { 
            title: 'Thời gian', 
            dataIndex: 'transactionDate', 
            align: 'right',
            width: 180,
            render: (date) => (
                <span>
                    {new Date(date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                    <br/> 
                    <span style={{color: '#888', fontSize: '12px'}}>
                        {new Date(date).toLocaleDateString('vi-VN')}
                    </span>
                </span>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card>
                {/* --- HEADER: TIÊU ĐỀ + BỘ LỌC + NÚT TẠO --- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>
                        <HistoryOutlined /> Lịch sử Giao dịch
                    </div>
                    
                    <Space>
                        {/* Ô CHỌN SẮP XẾP */}
                        <span style={{ fontWeight: 500 }}>Sắp xếp:</span>
                        <Select 
                            defaultValue="newest" 
                            style={{ width: 160 }} 
                            onChange={(value) => setSortOrder(value)}
                            suffixIcon={<SwapOutlined rotate={90} />}
                        >
                            <Option value="newest">🕒 Mới nhất trước</Option>
                            <Option value="oldest">📅 Cũ nhất trước</Option>
                        </Select>

                        {/* NÚT TẠO GIAO DỊCH */}
                        <Button type="primary" icon={<ShoppingCartOutlined />} size="middle" onClick={() => setIsModalOpen(true)}>
                            Tạo Giao dịch
                        </Button>
                    </Space>
                </div>

                {/* --- BẢNG DỮ LIỆU (Dùng hàm getSortedTransactions) --- */}
                <Table 
                    columns={columns} 
                    dataSource={getSortedTransactions()} // <--- Quan trọng: Dữ liệu đã sắp xếp
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    bordered
                />
            </Card>

            {/* --- MODAL POS (TẠO GIAO DỊCH) --- */}
            <Modal 
                title={<><CalculatorOutlined /> Thanh toán & Tích điểm</>}
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleCreateTransaction}>
                    
                    {/* 1. CHỌN KHÁCH HÀNG */}
                    <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Vui lòng chọn khách hàng!' }]}>
                        <Select 
                            showSearch
                            placeholder="Tìm theo tên hoặc số điện thoại..."
                            optionFilterProp="label"
                            onChange={handleCustomerChange}
                            size="large"
                            suffixIcon={<UserOutlined />}
                            options={customers.map(cus => ({
                                value: cus.id,
                                label: `${cus.name} - ${cus.phone}`
                            }))}
                        />
                    </Form.Item>

                    {/* 2. CHỌN VOUCHER */}
                    {redemptions.length > 0 ? (
                        <div style={{ background: '#fff7e6', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid #ffd591' }}>
                            <Space align="center" style={{ marginBottom: 8 }}>
                                <GiftOutlined style={{ color: '#fa8c16' }} /> 
                                <Text strong>Khách có {redemptions.length} ưu đãi khả dụng:</Text>
                            </Space>
                            <Form.Item name="redemptionId" noStyle>
                                <Select 
                                    placeholder="Chọn Voucher để áp dụng (Tùy chọn)"
                                    allowClear
                                    onChange={(val) => setSelectedRedemption(redemptions.find(r => r.id === val))}
                                    options={redemptions.map(v => ({
                                        value: v.id,
                                        label: `${v.reward.name} (HSD: ${new Date(v.expiryDate).toLocaleDateString()})`
                                    }))}
                                />
                            </Form.Item>
                        </div>
                    ) : (
                        form.getFieldValue('customerId') && <Alert message="Khách này chưa có Voucher." type="info" showIcon style={{ marginBottom: 16 }} />
                    )}

                    {/* 3. NHẬP TIỀN */}
                    <Form.Item name="amount" label="Tổng tiền hóa đơn" rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}>
                        <InputNumber 
                            style={{ width: '100%' }} 
                            size="large"
                            min={0}
                            formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={val => val?.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="VNĐ"
                        />
                    </Form.Item>

                    {/* 4. TỔNG KẾT */}
                    <Card size="small" style={{ background: '#f5f5f5' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text type="secondary">Tạm tính:</Text>
                            <Text>{billAmount.toLocaleString()}đ</Text>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#ff4d4f' }}>
                                <Text type="danger">Voucher giảm giá:</Text>
                                <Text type="danger">-{discount.toLocaleString()}đ</Text>
                            </div>
                        )}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ fontSize: 16 }}>KHÁCH CẦN TRẢ:</Text>
                            <Text strong style={{ fontSize: 20, color: '#1890ff' }}>{final.toLocaleString()}đ</Text>
                        </div>
                        <div style={{ marginTop: 8, textAlign: 'right' }}>
                            <Tag color="blue">Tích lũy: +{earned} điểm</Tag>
                        </div>
                    </Card>

                    <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 24, height: 48, fontSize: 16 }}>
                        Xác nhận Thanh toán
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default TransactionPage;