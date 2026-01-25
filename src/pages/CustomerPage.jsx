import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm, Row, Col, Card, Select } from 'antd'; // <--- Thêm Select
import { PlusOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, UserOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons'; // <--- Thêm SwapOutlined
import axiosClient from '../api/axiosClient';

// --- IMPORT CHAT NỘI BỘ ---
import InternalChat from '../components/InternalChat';

const { Option } = Select;

const CustomerPage = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State tìm kiếm & Sắp xếp
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // <--- MỚI: State sắp xếp (Mặc định Mới nhất)

    // State Modal Thêm/Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false); 

    // State Modal Lịch sử
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');

    // 1. Tải danh sách khách hàng
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/customers');
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error('Lỗi tải danh sách!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // 2. LOGIC LỌC VÀ SẮP XẾP (Quan trọng)
    const getProcessedCustomers = () => {
        // Bước 1: Lọc theo từ khóa tìm kiếm
        let result = customers.filter((item) => {
            const text = searchText.toLowerCase();
            return (
                (item.name && item.name.toLowerCase().includes(text)) || 
                (item.phone && item.phone.includes(text))
            );
        });

        // Bước 2: Sắp xếp kết quả đã lọc
        // Ta dùng ID để sắp xếp (ID lớn = Mới hơn)
        result.sort((a, b) => {
            if (sortOrder === 'newest') {
                return b.id - a.id; // Giảm dần
            } else {
                return a.id - b.id; // Tăng dần
            }
        });

        return result;
    };

    // 3. LƯU KHÁCH HÀNG (Optimistic UI)
    const handleSave = async (values) => {
        setSubmitting(true);
        try {
            if (editingCustomer) {
                // Sửa
                await axiosClient.put(`/customers/${editingCustomer.id}`, values);
                message.success('Cập nhật thành công!');

                setCustomers(prev => prev.map(item => 
                    item.id === editingCustomer.id ? { ...item, ...values } : item
                ));
            } else {
                // Thêm mới
                const res = await axiosClient.post('/customers', values);
                message.success('Thêm mới thành công!');

                if (res && res.id) {
                    const newCustomer = { ...res, pointBalance: 0, tier: 'Mới' };
                    // Thêm vào đầu danh sách
                    setCustomers(prev => [newCustomer, ...prev]);
                    // Nếu đang chọn chế độ "Cũ nhất", người dùng có thể không thấy ngay (vì nó nằm cuối),
                    // ta có thể tự động chuyển về "Mới nhất" để họ thấy:
                    setSortOrder('newest'); 
                } else {
                    fetchCustomers();
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    // 4. XÓA KHÁCH HÀNG
    const handleDelete = async (id) => {
        const originalCustomers = [...customers];
        setCustomers(prev => prev.filter(item => item.id !== id));

        try {
            await axiosClient.delete(`/customers/${id}`);
            message.success('Đã xóa khách hàng!');
        } catch (error) {
            message.error('Xóa thất bại! Đang khôi phục lại...');
            setCustomers(originalCustomers);
        }
    };

    // Xem lịch sử
    const handleViewHistory = async (customer) => {
        setSelectedCustomerName(customer.name);
        setIsHistoryModalOpen(true);
        setHistoryData([]); 

        try {
            const data = await axiosClient.get(`/transactions/customer/${customer.id}`);
            setHistoryData(Array.isArray(data) ? data : []);
        } catch (error) {
            message.error('Không thể tải lịch sử giao dịch!');
        }
    };

    const handleOpenModal = (customer = null) => {
        setEditingCustomer(customer);
        if (customer) form.setFieldsValue(customer);
        else form.resetFields();
        setIsModalOpen(true);
    };

    // Cấu hình cột bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
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
                    <Popconfirm title="Xóa khách hàng này?" onConfirm={() => handleDelete(record.id)} okText="Có" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

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
            {/* Header + Tìm kiếm */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={17}>
                    <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <span style={{ fontSize: 16, fontWeight: 'bold' }}> <UserOutlined /> Danh sách thành viên</span>
                            
                            <Space>
                                {/* <--- MỚI: Ô chọn Sắp xếp */}
                                <Select 
                                    value={sortOrder} 
                                    style={{ width: 140 }} 
                                    onChange={(val) => setSortOrder(val)}
                                    suffixIcon={<SwapOutlined rotate={90} />}
                                >
                                    <Option value="newest">Mới nhất</Option>
                                    <Option value="oldest">Cũ nhất</Option>
                                </Select>

                                <Input 
                                    placeholder="Tìm tên hoặc SĐT..." 
                                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    allowClear
                                    style={{ width: 200 }} 
                                />
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
                                    Thêm Khách
                                </Button>
                            </Space>
                        </div>

                        <Table 
                            columns={columns} 
                            dataSource={getProcessedCustomers()} // <--- Dùng hàm này thay vì filteredCustomers
                            rowKey="id" 
                            loading={loading} 
                            pagination={{ pageSize: 6 }}
                            size="middle"
                            locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
                        />
                    </Card>
                </Col>

                {/* Chat Nội bộ */}
                <Col xs={24} lg={7}>
                    <div style={{ height: '75vh', minHeight: '500px' }}>
                        <InternalChat />
                    </div>
                </Col>
            </Row>

            {/* Modal Thêm/Sửa */}
            <Modal 
                title={editingCustomer ? "Cập nhật thông tin" : "Thêm khách hàng mới"} 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
                maskClosable={!submitting} 
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}><Input /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email"><Input /></Form.Item>
                    
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={submitting} 
                    >
                        {editingCustomer ? 'Cập nhật' : 'Lưu khách hàng'}
                    </Button>
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