import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Switch, message, Popconfirm, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PercentageOutlined, RocketOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs'; // Thư viện xử lý ngày tháng (đã có sẵn trong React/Antd)

const { RangePicker } = DatePicker;

const PromotionPage = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [form] = Form.useForm();

    // 1. Tải danh sách Khuyến mãi
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/promotions');
            setPromotions(data);
        } catch (error) {
            message.error('Lỗi tải danh sách khuyến mãi!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    // 2. Mở Modal (Xử lý dữ liệu Ngày tháng)
    const handleOpenModal = (promo = null) => {
        setEditingPromo(promo);
        if (promo) {
            // Nếu là Sửa: Cần chuyển chuỗi ngày từ Backend thành đối tượng Dayjs cho RangePicker
            form.setFieldsValue({
                ...promo,
                dates: [dayjs(promo.startDate), dayjs(promo.endDate)]
            });
        } else {
            // Nếu Thêm mới: Reset form, mặc định Active = true, Hệ số = 1.5
            form.resetFields();
            form.setFieldsValue({
                active: true,
                multiplier: 1.5,
                dates: [dayjs(), dayjs().add(7, 'day')] // Mặc định chạy 1 tuần
            });
        }
        setIsModalOpen(true);
    };

    // 3. Lưu dữ liệu
    const handleSave = async (values) => {
        try {
            // Chuẩn bị dữ liệu gửi xuống Backend
            const payload = {
                name: values.name,
                description: values.description,
                multiplier: values.multiplier,
                active: values.active,
                // Tách RangePicker thành startDate và endDate
                startDate: values.dates[0].format('YYYY-MM-DD'),
                endDate: values.dates[1].format('YYYY-MM-DD')
            };

            if (editingPromo) {
                await axiosClient.put(`/promotions/${editingPromo.id}`, payload);
                message.success('Cập nhật sự kiện thành công!');
            } else {
                await axiosClient.post('/promotions', payload);
                message.success('Tạo sự kiện mới thành công!');
            }
            
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    // 4. Xóa sự kiện
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/promotions/${id}`);
            message.success('Đã xóa sự kiện!');
            fetchPromotions();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    // Cấu hình cột
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 50 },
        { 
            title: 'Tên Chiến dịch', 
            dataIndex: 'name', 
            key: 'name',
            render: t => <b style={{ color: '#d4380d' }}>{t}</b>
        },
        { 
            title: 'Hệ số nhân', 
            dataIndex: 'multiplier', 
            key: 'multiplier',
            render: val => <Tag color="red" style={{ fontSize: 14 }}>x{val}</Tag>
        },
        { 
            title: 'Thời gian áp dụng', 
            key: 'duration',
            render: (_, record) => (
                <div>
                    {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
                </div>
            )
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'active', 
            key: 'active',
            render: isActive => (
                <Tag color={isActive ? 'success' : 'default'}>
                    {isActive ? 'Đang chạy' : 'Đã tắt'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 10 }}>
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa sự kiện này?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Không">
                        <Button icon={<DeleteOutlined />} danger>Xóa</Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><RocketOutlined /> Quản lý Khuyến mãi</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                    Tạo Chiến dịch mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={promotions} 
                rowKey="id" 
                loading={loading} 
            />

            {/* Modal Form */}
            <Modal 
                title={editingPromo ? "Cập nhật Chiến dịch" : "Tạo Chiến dịch Mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Card style={{ background: '#fff2e8', marginBottom: 20, border: '1px dashed #ffbb96' }}>
                    <p>🔥 <i>Ví dụ: Sự kiện "Mừng Quốc Khánh" nhân 2 điểm từ ngày 01/09 đến 03/09.</i></p>
                </Card>

                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item 
                        name="name" 
                        label="Tên chiến dịch" 
                        rules={[{ required: true, message: 'Nhập tên sự kiện' }]}
                    >
                        <Input placeholder="VD: Siêu Sale 12.12" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả chi tiết..." />
                    </Form.Item>

                    <Form.Item 
                        name="dates" 
                        label="Thời gian diễn ra" 
                        rules={[{ required: true, message: 'Chọn ngày bắt đầu và kết thúc' }]}
                    >
                        <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 20 }}>
                        <Form.Item 
                            name="multiplier" 
                            label="Hệ số nhân điểm" 
                            rules={[{ required: true }]} 
                            style={{ flex: 1 }}
                        >
                            <InputNumber 
                                min={1.1} 
                                step={0.1} 
                                style={{ width: '100%' }} 
                                addonBefore="x" 
                                placeholder="1.5"
                            />
                        </Form.Item>

                        <Form.Item 
                            name="active" 
                            label="Trạng thái kích hoạt" 
                            valuePropName="checked"
                            style={{ flex: 1 }}
                        >
                            <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block size="large" icon={<RocketOutlined />}>
                        Lưu Chiến dịch
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionPage;