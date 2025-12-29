import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Switch, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const EmployeePage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();

    // 1. Lấy danh sách từ bảng EMPLOYEES
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/employees'); // <--- SỬA THÀNH /employees
            setUsers(data);
        } catch (error) {
            message.error('Lỗi tải danh sách nhân viên!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        if (user) {
            form.setFieldsValue(user);
        } else {
            form.resetFields();
            // Mặc định active là true
            form.setFieldsValue({ active: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (values) => {
        try {
            if (editingUser) {
                // 2. Cập nhật vào bảng EMPLOYEES
                await axiosClient.put(`/employees/${editingUser.id}`, values); // <--- SỬA THÀNH /employees
                message.success('Cập nhật thành công!');
            } else {
                // 3. Tạo mới vào bảng EMPLOYEES
                await axiosClient.post('/employees', values); // <--- SỬA THÀNH /employees
                message.success('Tạo nhân viên mới thành công!');
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra (Có thể trùng tên đăng nhập)!');
        }
    };

    const handleDelete = async (id) => {
        try {
            // 4. Xóa từ bảng EMPLOYEES
            await axiosClient.delete(`/employees/${id}`); // <--- SỬA THÀNH /employees
            message.success('Đã xóa nhân viên!');
            fetchUsers();
        } catch (error) {
            message.error('Xóa thất bại!');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: 'Tên đăng nhập', dataIndex: 'username', render: t => <b>{t}</b> },
        { title: 'Họ tên', dataIndex: 'fullName' },
        { 
            title: 'Vai trò', 
            dataIndex: 'role',
            // Nhân viên thì luôn là STAFF
            render: role => <Tag color="blue">{role || 'STAFF'}</Tag>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'active',
            render: active => <Tag color={active ? 'green' : 'gray'}>{active ? 'Hoạt động' : 'Đã khóa'}</Tag>
        },
        {
            title: 'Hành động',
            render: (_, record) => (
                <>
                    <Button icon={<EditOutlined />} type="link" onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa nhân viên này?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} type="link" danger>Xóa</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><UsergroupAddOutlined /> Quản lý Nhân viên</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>Thêm Nhân viên</Button>
            </div>

            <Card variant="borderless" style={{ borderRadius: 10 }}>
                <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
            </Card>

            <Modal title={editingUser ? "Sửa thông tin" : "Thêm nhân viên"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input disabled={!!editingUser} />
                    </Form.Item>
                    
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: !editingUser }]}>
                        <Input.Password placeholder={editingUser ? "Để trống nếu không đổi pass" : "Nhập mật khẩu..."} />
                    </Form.Item>
                    
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    
                    {/* Đã bỏ phần chọn Role vì tạo ở đây auto là STAFF */}

                    <Form.Item name="active" label="Trạng thái" valuePropName="checked">
                        <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
                    </Form.Item>
                    
                    <Button type="primary" htmlType="submit" block>Lưu dữ liệu</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeePage;