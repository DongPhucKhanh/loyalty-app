import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Tag, ColorPicker } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, TrophyOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const TierPage = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [form] = Form.useForm();

    // 1. Tải danh sách Hạng
    const fetchTiers = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/tiers');
            setTiers(data);
        } catch (error) {
            message.error('Lỗi tải danh sách hạng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    // 2. Mở Modal (Thêm hoặc Sửa)
    const handleOpenModal = (tier = null) => {
        setEditingTier(tier);
        if (tier) {
            // Nếu sửa, điền dữ liệu cũ vào form
            form.setFieldsValue(tier);
        } else {
            // Nếu thêm mới, reset form và đặt màu mặc định
            form.resetFields();
            form.setFieldValue('colorCode', '#1677ff');
        }
        setIsModalOpen(true);
    };

    // 3. Lưu dữ liệu
    const handleSave = async (values) => {
        try {
            // Chuyển đổi object màu của Antd sang chuỗi hex (nếu có dùng ColorPicker)
            const color = typeof values.colorCode === 'string' ? values.colorCode : values.colorCode.toHexString();
            const payload = { ...values, colorCode: color };

            if (editingTier) {
                await axiosClient.put(`/tiers/${editingTier.id}`, payload);
                message.success('Cập nhật hạng thành công!');
            } else {
                await axiosClient.post('/tiers', payload);
                message.success('Thêm hạng mới thành công!');
            }
            setIsModalOpen(false);
            fetchTiers(); // Tải lại bảng
        } catch (error) {
            message.error('Lỗi lưu dữ liệu!');
        }
    };

    // 4. Xóa hạng
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/tiers/${id}`);
            message.success('Đã xóa hạng!');
            fetchTiers();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Tên Hạng', 
            dataIndex: 'name', 
            key: 'name',
            render: (text, record) => (
                <Tag color={record.colorCode || 'default'} style={{ fontSize: '14px', padding: '4px 10px' }}>
                    {text}
                </Tag>
            )
        },
        { 
            title: 'Điểm tối thiểu', 
            dataIndex: 'minPoint', 
            key: 'minPoint',
            render: (val) => <b>{val} điểm</b>,
            sorter: (a, b) => a.minPoint - b.minPoint, // Cho phép sắp xếp theo điểm
            defaultSortOrder: 'ascend'
        },
        {
            title: 'Màu sắc',
            dataIndex: 'colorCode',
            key: 'colorCode',
            render: (color) => (
                <div style={{ 
                    width: 20, 
                    height: 20, 
                    background: color, 
                    borderRadius: '50%', 
                    border: '1px solid #ddd' 
                }} />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><TrophyOutlined /> Quản lý Hạng Thành viên</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Hạng mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={tiers} 
                rowKey="id" 
                loading={loading}
                pagination={false} // Thường hạng ít nên không cần phân trang
            />

            {/* Modal Form */}
            <Modal 
                title={editingTier ? "Cập nhật Hạng" : "Thêm Hạng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item 
                        name="name" 
                        label="Tên Hạng (VD: Vàng, Bạc)" 
                        rules={[{ required: true, message: 'Vui lòng nhập tên hạng' }]}
                    >
                        <Input placeholder="Nhập tên hạng..." />
                    </Form.Item>

                    <Form.Item 
                        name="minPoint" 
                        label="Điểm tối thiểu cần đạt" 
                        rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 500" />
                    </Form.Item>

                    <Form.Item 
                        name="colorCode" 
                        label="Màu đại diện (Hiển thị trên bảng)"
                        rules={[{ required: true }]}
                        initialValue="#1677ff"
                    >
                         {/* Dùng ColorPicker của Antd hoặc Input thường đều được */}
                        <Input type="color" style={{ width: 100, padding: 2, height: 35 }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large">
                        Lưu lại
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default TierPage;