import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const CustomerPage = () => {
    // State cho bảng khách hàng
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal Thêm/Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    // === STATE MỚI CHO MODAL LỊCH SỬ ===
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    // ===================================

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

    // 2. Hàm xem lịch sử (MỚI)
    const handleViewHistory = async (customer) => {
        setSelectedCustomerName(customer.name);
        setIsHistoryModalOpen(true); // Mở modal ngay để người dùng biết đang tải
        setHistoryData([]); // Xóa dữ liệu cũ

        try {
            // Gọi API Backend vừa tạo
            const data = await axiosClient.get(`/transactions/customer/${customer.id}`);
            setHistoryData(data);
        } catch (error) {
            message.error('Không thể tải lịch sử giao dịch!');
        }
    };

    // 3. Các hàm cũ (Mở modal thêm/sửa, Lưu, Xóa) - GIỮ NGUYÊN
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

    // Cấu hình cột cho bảng Khách hàng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
        { title: 'Tên khách hàng', dataIndex: 'name', key: 'name', render: t => <b>{t}</b> },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { 
            title: 'Hạng', dataIndex: 'tier', key: 'tier',
            render: tier => <Tag color={tier === 'Vàng' ? 'gold' : tier === 'Bạc' ? 'cyan' : 'default'}>{tier || 'Mới'}</Tag>
        },
        // SỬA ĐỔI QUAN TRỌNG: dataIndex 'pointBalance' -> 'points'
        { title: 'Điểm', dataIndex: 'pointBalance', key: 'pointBalance', render: p => <b style={{color: 'green'}}>{p || 0}</b> },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {/* NÚT LỊCH SỬ MỚI */}
                    <Button 
                        icon={<HistoryOutlined />} 
                        onClick={() => handleViewHistory(record)}
                        title="Xem lịch sử điểm"
                    >
                        LS
                    </Button>

                    <Button icon={<EditOutlined />} type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    
                    <Popconfirm title="Xóa khách hàng?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
                        <Button icon={<DeleteOutlined />} type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Cấu hình cột cho bảng Lịch sử (Trong Modal)
    const historyColumns = [
        { title: 'Ngày GD', dataIndex: 'transactionDate', key: 'date', render: d => new Date(d).toLocaleString('vi-VN') },
        { 
            title: 'Loại GD', 
            dataIndex: 'type', 
            key: 'type',
            render: type => (
                <Tag color={type === 'PRODUCT' ? 'blue' : type === 'SERVICE_APP' ? 'purple' : 'default'}>
                    {type === 'PRODUCT' ? 'Mua hàng' : type}
                </Tag>
            )
        },
        { 
            title: 'Số tiền', 
            dataIndex: 'totalAmount', 
            key: 'amount',
            render: val => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        },
        { title: 'Điểm cộng', dataIndex: 'pointsEarned', key: 'points', render: p => <b style={{color: 'green'}}>+{p}</b> },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Quản lý Khách hàng</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Thêm Khách hàng</Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={customers} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 6 }}
            />

            {/* Modal Thêm/Sửa Khách hàng */}
            <Modal title={editingCustomer ? "Cập nhật" : "Thêm mới"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email"><Input /></Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu lại</Button>
                </Form>
            </Modal>

            {/* === MODAL HIỂN THỊ LỊCH SỬ GIAO DỊCH (MỚI) === */}
            <Modal 
                title={`Lịch sử tích điểm: ${selectedCustomerName}`} 
                open={isHistoryModalOpen} 
                onCancel={() => setIsHistoryModalOpen(false)} 
                footer={null}
                width={700} // Cho bảng rộng ra chút
            >
                <Table 
                    columns={historyColumns} 
                    dataSource={historyData} 
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: 'Khách hàng này chưa có giao dịch nào' }}
                />
            </Modal>
        </div>
    );
};

export default CustomerPage;