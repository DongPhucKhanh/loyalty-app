import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Tag, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const { Option } = Select;

const RewardPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Quản lý Modal (Hộp thoại thêm/sửa)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [form] = Form.useForm();

    // Theo dõi giá trị 'type' để ẩn/hiện ô nhập giá trị giảm giá
    const rewardType = Form.useWatch('type', form);

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
            form.setFieldsValue(reward);
        } else {
            form.resetFields();
            // Thiết lập giá trị mặc định cho quà tặng mới
            form.setFieldsValue({ type: 'GIFT', discountValue: 0 });
        }
        setIsModalOpen(true);
    };

    // 3. Lưu dữ liệu (Gọi API POST hoặc PUT)
    const handleSave = async (values) => {
        try {
            // Nếu là quà tặng vật lý (GIFT), đảm bảo discountValue là 0 chứ không phải null
            const payload = {
                ...values,
                discountValue: values.type === 'VOUCHER' ? values.discountValue : 0
            };

            if (editingReward) {
                await axiosClient.put(`/rewards/${editingReward.id}`, payload);
                message.success('Đã cập nhật phần thưởng!');
            } else {
                await axiosClient.post('/rewards', payload);
                message.success('Đã thêm phần thưởng mới!');
            }
            setIsModalOpen(false);
            fetchRewards();
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
        { 
            title: 'Loại', 
            dataIndex: 'type', 
            key: 'type',
            render: type => (
                <Tag color={type === 'VOUCHER' ? 'blue' : 'green'}>
                    {type === 'VOUCHER' ? 'VOUCHER' : 'QUÀ VẬT LÝ'}
                </Tag>
            )
        },
        { 
            title: 'Điểm đổi', 
            dataIndex: 'pointCost', 
            key: 'pointCost',
            render: points => <Tag color="gold" style={{fontWeight: 'bold'}}>{points} điểm</Tag> 
        },
        { 
            title: 'Giá trị giảm', 
            dataIndex: 'discountValue', 
            key: 'discountValue',
            render: val => val > 0 ? (
                <b style={{color: '#1890ff'}}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
                </b>
            ) : '-'
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><GiftOutlined /> Quản lý Kho Quà</h2>
                
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Thêm Phần thưởng
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={rewards} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 6 }}
                bordered
            />

            <Modal 
                title={editingReward ? "Sửa thông tin quà" : "Thêm Phần thưởng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên phần thưởng" rules={[{ required: true, message: 'Nhập tên quà' }]}>
                        <Input placeholder="Ví dụ: Voucher 50k" />
                    </Form.Item>
                    
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả chi tiết về quà tặng hoặc điều kiện sử dụng..." />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="type" label="Loại phần thưởng" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select placeholder="Chọn loại">
                                <Option value="VOUCHER">VOUCHER (Giảm tiền hóa đơn)</Option>
                                <Option value="GIFT">GIFT (Quà tặng vật lý)</Option>
                            </Select>
                        </Form.Item>

                        {rewardType === 'VOUCHER' && (
                            <Form.Item name="discountValue" label="Giá trị giảm (VNĐ)" rules={[{ required: true }]} style={{ flex: 1 }}>
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    min={0} 
                                    step={1000}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="VD: 50000" 
                                />
                            </Form.Item>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="pointCost" label="Điểm cần đổi" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 100" />
                        </Form.Item>

                        <Form.Item name="stockQuantity" label="Số lượng tồn kho" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="VD: 50" />
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
                        Lưu phần thưởng
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default RewardPage;