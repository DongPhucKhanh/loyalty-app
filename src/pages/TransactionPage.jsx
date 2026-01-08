import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, message, Tag, Card, Divider, Alert } from 'antd';
import { 
    PlusOutlined, ShoppingCartOutlined, DownloadOutlined, 
    GiftOutlined 
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // --- QUẢN LÝ VOUCHER ---
    const [redemptions, setRedemptions] = useState([]); 
    const [selectedRedemption, setSelectedRedemption] = useState(null); 
    const [form] = Form.useForm();

    const billAmount = Form.useWatch('amount', form) || 0;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transData, custData] = await Promise.all([
                axiosClient.get('/transactions'),
                axiosClient.get('/customers')
            ]);
            setTransactions(transData);
            setCustomers(custData);
        } catch (error) {
            message.error('Lỗi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    // --- CẬP NHẬT: GỬI REDEMPTION_ID ĐỂ ĐỔI TRẠNG THÁI VOUCHER ---
    const handleCreateTransaction = async (values) => {
        try {
            // Lấy ID của bản ghi Voucher cụ thể khách đang giữ
            const redemId = selectedRedemption ? selectedRedemption.id : null;
            
            // Query gửi lên Backend: Dùng redemptionId thay vì rewardId
            const query = `customerId=${values.customerId}&amount=${values.amount}${redemId ? `&redemptionId=${redemId}` : ''}`;
            
            await axiosClient.post(`/transactions/add-points?${query}`);
            
            message.success('Thanh toán thành công! Voucher của khách đã được cập nhật.');
            setIsModalOpen(false);
            form.resetFields();
            setSelectedRedemption(null);
            fetchData();
        } catch (error) {
            message.error('Lỗi: ' + (error.response?.data || 'Giao dịch thất bại'));
        }
    };

    // --- CẬP NHẬT: LOGIC TÍNH TIỀN GIẢM GIÁ (Dựa trên Database bạn cung cấp) ---
    const calculateFinal = () => {
        let disc = 0;
        if (selectedRedemption) {
            const reward = selectedRedemption.reward;
            // Nếu discountValue là 50000 -> Giảm 50k. Nếu là 10 -> Giảm 10%
            if (reward.discountValue > 100) {
                disc = reward.discountValue; // Giảm tiền mặt
            } else {
                disc = billAmount * (reward.discountValue / 100); // Giảm theo %
            }
        }
        return { 
            discount: disc, 
            final: Math.max(0, billAmount - disc), 
            earned: Math.floor(billAmount / 10000) 
        };
    };

    const { discount, final, earned } = calculateFinal();

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Khách hàng', 
            dataIndex: ['customer', 'name'], 
            render: (text, record) => (
                <div>
                    <b>{text}</b><br/>
                    <small style={{ color: '#888' }}>{record.customer?.phone}</small>
                </div>
            )
        },
        { 
            title: 'Hóa đơn gốc', 
            dataIndex: 'totalAmount', 
            render: (val) => `${val?.toLocaleString()}đ`
        },
        { 
            title: 'Giảm giá', 
            dataIndex: 'discountAmount', 
            render: (val) => val > 0 ? <span style={{color: '#f5222d'}}>-{val?.toLocaleString()}đ</span> : '-'
        },
        { 
            title: 'Thực thu', 
            dataIndex: 'finalAmount', 
            render: (val) => <b style={{color: '#52c41a'}}>{val?.toLocaleString()}đ</b>
        },
        { 
            title: 'Điểm (+/-)', 
            key: 'points',
            render: (_, record) => (
                <div>
                    <Tag color="green">+{record.pointsEarned}</Tag>
                    {record.pointsUsed > 0 && <Tag color="volcano">-{record.pointsUsed}</Tag>}
                </div>
            )
        },
        { 
            title: 'Thời gian', 
            dataIndex: 'transactionDate', 
            render: (date) => new Date(date).toLocaleString('vi-VN')
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2><ShoppingCartOutlined /> Quản lý Giao dịch (POS)</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Tạo Giao dịch mới
                </Button>
            </div>

            <Table columns={columns} dataSource={transactions} rowKey="id" loading={loading} />

            <Modal 
                title="Thanh toán & Áp dụng Voucher" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateTransaction}>
                    <Form.Item name="customerId" label="1. Chọn Khách hàng" rules={[{ required: true }]}>
                        <Select 
                            showSearch
                            placeholder="Chọn khách hàng..."
                            optionFilterProp="label"
                            onChange={handleCustomerChange}
                            options={customers.map(cus => ({
                                value: cus.id,
                                label: `${cus.name} - ${cus.phone}`
                            }))}
                        />
                    </Form.Item>

                    {redemptions.length > 0 && (
                        <Alert
                            style={{ marginBottom: 16 }}
                            message="Khách hàng này có ưu đãi khả dụng!"
                            type="warning"
                            showIcon
                            description={
                                <Form.Item name="redemptionId" noStyle>
                                    <Select 
                                        placeholder="Chọn Voucher để sử dụng"
                                        allowClear
                                        onChange={(val) => setSelectedRedemption(redemptions.find(r => r.id === val))}
                                    >
                                        {redemptions.map(v => (
                                            <Select.Option key={v.id} value={v.id}>
                                                <GiftOutlined /> {v.reward.name} (HSD: {new Date(v.expiryDate).toLocaleDateString()})
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            }
                        />
                    )}

                    <Form.Item name="amount" label="2. Tổng tiền hóa đơn gốc (VNĐ)" rules={[{ required: true }]}>
                        <InputNumber 
                            style={{ width: '100%' }} 
                            formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            addonAfter="VNĐ"
                        />
                    </Form.Item>

                    <Card size="small" style={{ background: '#f9f9f9', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Tạm tính (Gốc):</span>
                            <span>{billAmount.toLocaleString()}đ</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f5222d' }}>
                                <span>Giảm giá:</span>
                                <span>-{discount.toLocaleString()}đ</span>
                            </div>
                        )}
                        <Divider style={{ margin: '8px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold' }}>THỰC THU:</span>
                            <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: 18 }}>
                                {final.toLocaleString()}đ
                            </span>
                        </div>
                    </Card>

                    <Button type="primary" htmlType="submit" block style={{ marginTop: 20 }}>
                        Xác nhận & Đóng Voucher
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default TransactionPage;