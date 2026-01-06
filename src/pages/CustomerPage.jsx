import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm, Row, Col, Card } from 'antd'; // <--- Thêm Row, Col, Card
import { PlusOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

// --- 1. IMPORT CHAT NỘI BỘ ---
import InternalChat from '../components/InternalChat';
// -----------------------------

const CustomerPage = () => {
    // State cho bảng khách hàng
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal Thêm/Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    // State cho Modal Lịch sử
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');

    // 1. Tải danh sách khách hàng
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/customers');
            setCustomers(data);
        } catch (error) {
            message.error('Lỗi tải danh sách!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // 2. Xem lịch sử
    const handleViewHistory = async (customer) => {
        setSelectedCustomerName(customer.name);
        setIsHistoryModalOpen(true);
        setHistoryData([]); 

        try {
            const data = await axiosClient.get(`/transactions/customer/${customer.id}`);
            setHistoryData(data);
        } catch (error) {
            message.error('Không thể tải lịch sử giao dịch!');
        }
    };

    // 3. Các hàm xử lý Thêm/Sửa/Xóa
    const handleOpenModal = (customer = null) => {
        setEditingCustomer(customer);
        if (customer) form.setFieldsValue(customer);
        else form.resetFields();
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingCustomer) {
                await axiosClient.put(`/customers/${editingCustomer.id}`, values);
                message.success('Cập nhật thành công!');
            } else {
                await axiosClient.post('/customers', values);
                message.success('Thêm mới thành công!');
            }
            setIsModalOpen(false);
            fetchCustomers();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/customers/${id}`);
            message.success('Đã xóa khách hàng!');
            fetchCustomers();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột bảng Khách hàng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
        { title: 'Tên khách hàng', dataIndex: 'name', key: 'name', render: t => <b>{t}</b> },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { 
            title: 'Hạng', dataIndex: 'tier', key: 'tier',
            render: tier => <Tag color={tier === 'Vàng' ? 'gold' : tier === 'Bạc' ? 'cyan' : 'blue'}>{tier || 'Mới'}</Tag>
        },
        { title: 'Điểm', dataIndex: 'pointBalance', key: 'pointBalance', render: p => <b style={{color: 'green'}}>{p || 0}</b> },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button 
                        icon={<HistoryOutlined />} 
                        onClick={() => handleViewHistory(record)}
                        title="Xem lịch sử điểm"
                    />
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Xóa khách hàng?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Cột bảng Lịch sử
    const historyColumns = [
        { title: 'Ngày GD', dataIndex: 'transactionDate', key: 'date', render: d => new Date(d).toLocaleString('vi-VN') },
        { 
            title: 'Loại GD', dataIndex: 'type', key: 'type',
            render: type => <Tag color="purple">{type}</Tag>
        },
        { 
            title: 'Số tiền', dataIndex: 'totalAmount', key: 'amount',
            render: val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        },
        { title: 'Điểm', dataIndex: 'pointsEarned', key: 'points', render: p => <b style={{color: 'green'}}>+{p}</b> },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2 style={{ marginBottom: 20 }}><UserOutlined /> Quản lý Khách hàng</h2>

            {/* --- BỐ CỤC CHIA 2 CỘT --- */}
            <Row gutter={[16, 16]}>
                
                {/* CỘT 1: DANH SÁCH KHÁCH HÀNG (Chiếm 17/24 phần) */}
                <Col xs={24} lg={17}>
                    <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 16, fontWeight: 'bold' }}>Danh sách thành viên</span>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                                Thêm Khách
                            </Button>
                        </div>

                        <Table 
                            columns={columns} 
                            dataSource={customers} 
                            rowKey="id" 
                            loading={loading} 
                            pagination={{ pageSize: 6 }}
                            size="middle"
                        />
                    </Card>
                </Col>

                {/* CỘT 2: CHAT NỘI BỘ (Chiếm 7/24 phần) */}
                <Col xs={24} lg={7}>
                    {/* Đặt chiều cao cố định để Chat hiển thị đẹp */}
                    <div style={{ height: '75vh', minHeight: '500px' }}>
                        <InternalChat />
                    </div>
                </Col>
            </Row>

            {/* Modal Thêm/Sửa */}
            <Modal title={editingCustomer ? "Cập nhật" : "Thêm mới"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email"><Input /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu lại</Button>
                </Form>
            </Modal>

            {/* Modal Lịch sử */}
            <Modal 
                title={`Lịch sử tích điểm: ${selectedCustomerName}`} 
                open={isHistoryModalOpen} 
                onCancel={() => setIsHistoryModalOpen(false)} 
                footer={null}
                width={700}
            >
                <Table 
                    columns={historyColumns} 
                    dataSource={historyData} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: 'Chưa có giao dịch nào' }}
                />
            </Modal>
        </div>
    );
};

export default CustomerPage;