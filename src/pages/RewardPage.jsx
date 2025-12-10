import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const RewardPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Quản lý Modal (Hộp thoại thêm/sửa)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [form] = Form.useForm();

    // 1. Tải danh sách quà từ Backend
    const fetchRewards = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/rewards');
            setRewards(data);
        } catch (error) {
            message.error('Lỗi tải danh sách quà!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    // 2. Mở Modal để Thêm hoặc Sửa
    const handleOpenModal = (reward = null) => {
        setEditingReward(reward);
        if (reward) {
            form.setFieldsValue(reward); // Điền dữ liệu cũ nếu là Sửa
        } else {
            form.resetFields(); // Xóa trắng nếu là Thêm mới
        }
        setIsModalOpen(true);
    };

    // 3. Lưu dữ liệu (Gọi API POST hoặc PUT)
    const handleSave = async (values) => {
        try {
            if (editingReward) {
                // Sửa
                await axiosClient.put(`/rewards/${editingReward.id}`, values);
                message.success('Đã cập nhật phần thưởng!');
            } else {
                // Thêm mới
                await axiosClient.post('/rewards', values);
                message.success('Đã thêm phần thưởng mới!');
            }
            setIsModalOpen(false);
            fetchRewards(); // Tải lại bảng
        } catch (error) {
            message.error('Lỗi! Không thể lưu phần thưởng.');
        }
    };

    // 4. Xóa quà
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/rewards/${id}`);
            message.success('Đã xóa phần thưởng!');
            fetchRewards();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột cho bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
        { title: 'Tên phần thưởng', dataIndex: 'name', key: 'name', render: text => <b>{text}</b> },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        { 
            title: 'Điểm đổi', 
            dataIndex: 'pointCost', 
            key: 'pointCost',
            render: points => <Tag color="gold" style={{fontWeight: 'bold'}}>{points} điểm</Tag> 
        },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stockQuantity', 
            key: 'stockQuantity',
            render: qty => (
                <b style={{ color: qty > 0 ? 'green' : 'red' }}>
                    {qty > 0 ? qty : 'Hết hàng'}
                </b>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* ĐÂY LÀ PHẦN NÚT BẤM BẠN ĐANG TÌM */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><GiftOutlined /> Quản lý Kho Quà</h2>
                
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Phần thưởng
                </Button>
            </div>

            {/* Bảng dữ liệu */}
            <Table 
                columns={columns} 
                dataSource={rewards} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 5 }}
            />

            {/* Form nhập liệu (Modal) */}
            <Modal 
                title={editingReward ? "Sửa thông tin quà" : "Thêm Phần thưởng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên phần thưởng" rules={[{ required: true, message: 'Nhập tên quà' }]}>
                        <Input placeholder="Ví dụ: Voucher 50k" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả chi tiết..." />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="pointCost" label="Điểm cần đổi" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 100" />
                        </Form.Item>

                        <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 50" />
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block size="large">
                        Lưu lại
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RewardPage;