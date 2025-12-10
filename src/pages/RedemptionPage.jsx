import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message, Tag, Card } from 'antd';
import { GiftOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const RedemptionPage = () => {
    const [history, setHistory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State quản lý Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // 1. Tải dữ liệu: Lịch sử, Danh sách Khách, Danh sách Quà
    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi song song 3 API để tiết kiệm thời gian
            const [histData, custData, rewardData] = await Promise.all([
                axiosClient.get('/rewards/history'),
                axiosClient.get('/customers'),
                axiosClient.get('/rewards')
            ]);
            setHistory(histData);
            setCustomers(custData);
            setRewards(rewardData);
        } catch (error) {
            message.error('Lỗi tải dữ liệu từ hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Xử lý Đổi quà
    const handleRedeem = async (values) => {
        try {
            // Gọi API: POST /api/rewards/redeem
            await axiosClient.post('/rewards/redeem', {
                customerId: values.customerId,
                rewardId: values.rewardId
            });
            
            message.success('Đổi quà thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchData(); // Tải lại bảng lịch sử và cập nhật lại điểm khách hàng
        } catch (error) {
            // Hiển thị lỗi từ Backend trả về (Ví dụ: Không đủ điểm)
            message.error(error.response?.data || 'Đổi quà thất bại!');
        }
    };

    // Cấu hình cột cho bảng Lịch sử
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Khách hàng', 
            dataIndex: ['customer', 'name'], 
            key: 'customerName',
            render: (text, record) => (
                <div>
                    <b>{text}</b>
                    <br/>
                    <small style={{color: '#888'}}>{record.customer.phone}</small>
                </div>
            )
        },
        { 
            title: 'Phần thưởng', 
            dataIndex: ['reward', 'name'], 
            key: 'rewardName',
            render: t => <Tag color="purple" style={{ fontSize: '14px', padding: '4px 8px' }}>{t}</Tag>
        },
        { 
            title: 'Điểm đã trừ', 
            dataIndex: 'pointsUsed', 
            key: 'pointsUsed',
            render: p => <b style={{color: 'red'}}>-{p} điểm</b>
        },
        { 
            title: 'Thời gian đổi', 
            dataIndex: 'redeemedAt', 
            key: 'redeemedAt',
            render: d => new Date(d).toLocaleString('vi-VN')
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><HistoryOutlined /> Lịch sử Đổi quà</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Đổi quà cho khách
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={history} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 8 }} 
            />

            {/* Modal Form Đổi Quà */}
            <Modal 
                title="Đổi quà thưởng" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Card style={{ background: '#f9f9f9', marginBottom: 20, border: '1px dashed #d9d9d9' }}>
                    <p>💡 <i>Lưu ý: Hệ thống sẽ tự động kiểm tra điểm tích lũy của khách hàng và số lượng tồn kho của quà tặng.</i></p>
                </Card>

                <Form form={form} layout="vertical" onFinish={handleRedeem}>
                    {/* Ô chọn Khách hàng (Có tìm kiếm SĐT) */}
                    <Form.Item 
                        name="customerId" 
                        label="Chọn Khách hàng" 
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                        <Select 
                            showSearch
                            placeholder="Nhập tên hoặc số điện thoại..."
                            optionFilterProp="children"
                            size="large"
                            
                            // Logic tìm kiếm: So sánh cả Tên và SĐT
                            filterOption={(input, option) => 
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            
                            // Dữ liệu hiển thị trong danh sách
                            options={customers.map(cus => ({
                                value: cus.id,
                                // Label chứa cả SĐT để tìm kiếm được
                                label: `${cus.name} - ${cus.phone} (Hiện có: ${cus.pointBalance} điểm)` 
                            }))}
                        />
                    </Form.Item>

                    {/* Ô chọn Phần thưởng */}
                    <Form.Item 
                        name="rewardId" 
                        label="Chọn Phần thưởng" 
                        rules={[{ required: true, message: 'Vui lòng chọn quà' }]}
                    >
                        <Select 
                            placeholder="Chọn quà muốn đổi..."
                            size="large"
                            options={rewards.map(rew => ({
                                value: rew.id,
                                label: `${rew.name} - ${rew.pointCost} điểm (Còn lại: ${rew.stockQuantity})`,
                                disabled: rew.stockQuantity <= 0 // Hết hàng thì khóa lại không cho chọn
                            }))}
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" icon={<GiftOutlined />}>
                        Xác nhận Đổi quà
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RedemptionPage;