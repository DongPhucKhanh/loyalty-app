import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Option } = Select;

const RewardPage = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // --- STATE CHO MODAL & FORM ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false); // <--- MỚI: State xoay nút Lưu

    // Theo dõi loại quà để ẩn/hiện ô nhập tiền
    const rewardType = Form.useWatch('type', form);

    // 1. Tải danh sách (Chỉ chạy 1 lần khi vào trang hoặc khi xóa)
    const fetchRewards = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/rewards');
            setRewards(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error('Lỗi tải danh sách quà!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    // 2. Mở Modal
    const handleOpenModal = (reward = null) => {
        setEditingReward(reward);
        if (reward) {
            form.setFieldsValue(reward);
        } else {
            form.resetFields();
            // Giá trị mặc định
            form.setFieldsValue({ type: 'GIFT', discountValue: 0, pointCost: 100, stockQuantity: 10 });
        }
        setIsModalOpen(true);
    };

    // 3. LƯU DỮ LIỆU (TỐI ƯU TỐC ĐỘ)
    const handleSave = async (values) => {
        // --- A. CHECK TRÙNG TÊN (Client-side) ---
        const newName = values.name.trim().toLowerCase();
        const isDuplicate = rewards.some(item => {
            if (editingReward && item.id === editingReward.id) return false;
            return item.name.trim().toLowerCase() === newName;
        });

        if (isDuplicate) {
            message.error('❌ Tên phần thưởng này đã tồn tại!');
            return;
        }

        // --- B. GỌI API & CẬP NHẬT NHANH ---
        setSubmitting(true); // Bật hiệu ứng xoay
        try {
            const payload = {
                ...values,
                discountValue: values.type === 'VOUCHER' ? values.discountValue : 0
            };

            if (editingReward) {
                // --- TRƯỜNG HỢP SỬA ---
                await axiosClient.put(`/rewards/${editingReward.id}`, payload);
                message.success('Cập nhật thành công!');

                // TỐI ƯU: Tự sửa dữ liệu trong bảng luôn (Không cần gọi fetchRewards lại)
                setRewards(prev => prev.map(item => 
                    item.id === editingReward.id ? { ...item, ...payload } : item
                ));
            } else {
                // --- TRƯỜNG HỢP THÊM MỚI ---
                const res = await axiosClient.post('/rewards', payload);
                message.success('Thêm mới thành công!');

                // TỐI ƯU: Nếu Server trả về object vừa tạo (có ID), chèn luôn vào bảng
                if (res && res.id) {
                    setRewards(prev => [res, ...prev]);
                } else {
                    // Backup: Nếu API không trả về data thì mới phải load lại
                    fetchRewards();
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error('Lỗi lưu dữ liệu: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false); // Tắt hiệu ứng xoay
        }
    };

    // 4. Xóa
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/rewards/${id}`);
            message.success('Đã xóa!');
            // Xóa xong thì lọc bỏ item đó khỏi state luôn cho nhanh
            setRewards(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            message.error('Không thể xóa (có thể đang được sử dụng)!');
        }
    };

    // Cấu hình Cột
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50, align: 'center' },
        { title: 'Tên phần thưởng', dataIndex: 'name', key: 'name', render: t => <b>{t}</b> },
        { 
            title: 'Loại', dataIndex: 'type', key: 'type',
            render: type => <Tag color={type === 'VOUCHER' ? 'blue' : 'green'}>{type === 'VOUCHER' ? 'VOUCHER' : 'QUÀ VẬT LÝ'}</Tag>
        },
        { 
            title: 'Điểm đổi', dataIndex: 'pointCost', key: 'pointCost',
            render: p => <Tag color="gold" style={{fontWeight: 'bold'}}>{p} điểm</Tag> 
        },
        { 
            title: 'Giá trị giảm', dataIndex: 'discountValue', key: 'discountValue',
            render: v => v > 0 ? <b style={{color: '#1890ff'}}>{new Intl.NumberFormat('vi-VN').format(v)}đ</b> : '-'
        },
        { 
            title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity',
            render: q => <b style={{ color: q > 0 ? 'green' : 'red' }}>{q > 0 ? q : 'Hết hàng'}</b>
        },
        {
            title: 'Hành động', key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa phần thưởng này?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} type="link" danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header */}
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
                pagination={{ pageSize: 6 }}
                bordered
            />

            {/* Modal Form */}
            <Modal 
                title={editingReward ? "Sửa thông tin quà" : "Thêm Phần thưởng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                width={600}
                maskClosable={!submitting} // Không cho đóng khi đang lưu
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên phần thưởng" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Ví dụ: Voucher 50k" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả chi tiết..." rows={2} />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="type" label="Loại phần thưởng" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                <Option value="VOUCHER">VOUCHER (Giảm tiền)</Option>
                                <Option value="GIFT">GIFT (Quà vật lý)</Option>
                            </Select>
                        </Form.Item>

                        {rewardType === 'VOUCHER' && (
                            <Form.Item name="discountValue" label="Giá trị giảm (VNĐ)" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <InputNumber 
                                    style={{ width: '100%' }} min={0} step={1000}
                                    formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={v => v.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="pointCost" label="Điểm cần đổi" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>

                        <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </div>

                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        size="large" 
                        style={{ marginTop: 10 }}
                        loading={submitting} // <--- Hiệu ứng loading ở đây
                    >
                        {editingReward ? 'Cập nhật' : 'Lưu phần thưởng'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RewardPage;