import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, message, Tag, Card } from 'antd';
import { PlusOutlined, ShoppingCartOutlined, DownloadOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]); // Danh sách khách để chọn trong dropdown
    const [loading, setLoading] = useState(false);
    
    // State cho Modal tạo giao dịch
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // 1. Hàm tải dữ liệu (Giao dịch + Khách hàng)
    const fetchData = async () => {
        setLoading(true);
        try {
            // Gọi song song cả 2 API để tiết kiệm thời gian
            const [transData, custData] = await Promise.all([
                axiosClient.get('/transactions'),
                axiosClient.get('/customers')
            ]);
            setTransactions(transData);
            setCustomers(custData);
        } catch (error) {
            message.error('Lỗi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Xử lý khi bấm nút "Thanh toán & Cộng điểm"
    const handleCreateTransaction = async (values) => {
        try {
            // Gọi API tạo giao dịch
            await axiosClient.post(`/transactions/add-points?customerId=${values.customerId}&amount=${values.amount}`);
            
            message.success('Giao dịch thành công! Đã cộng điểm cho khách.');
            setIsModalOpen(false);
            form.resetFields();
            fetchData(); // Tải lại bảng ngay lập tức
        } catch (error) {
            message.error('Giao dịch thất bại! Vui lòng thử lại.');
        }
    };

    // 3. Xử lý Xuất file Excel (Tính năng mới)
    const handleExport = async () => {
        try {
            message.loading({ content: 'Đang tạo file Excel...', key: 'exporting' });
            
            // Gọi API với responseType là 'blob' (quan trọng để tải file)
            const response = await axiosClient.get('/reports/transactions/export', {
                responseType: 'blob' 
            });

            // Tạo link ảo để trình duyệt tải về
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `BaoCao_GiaoDich_${new Date().getTime()}.xlsx`); // Tên file kèm timestamp
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            message.success({ content: 'Tải báo cáo thành công!', key: 'exporting' });
        } catch (error) {
            console.error(error);
            message.error({ content: 'Lỗi xuất file! Hãy kiểm tra lại Server.', key: 'exporting' });
        }
    };

    // Cấu hình cột cho bảng
    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Khách hàng', 
            dataIndex: ['customer', 'name'], 
            key: 'customerName',
            render: (text, record) => (
                <div>
                    <b style={{ color: '#1890ff' }}>{text}</b>
                    <br/>
                    <small style={{ color: '#888' }}>{record.customer?.phone}</small>
                </div>
            )
        },
        { 
            title: 'Số tiền hóa đơn', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
        },
        { 
            title: 'Điểm tích được', 
            dataIndex: 'pointsEarned', 
            key: 'pointsEarned',
            render: (val) => <Tag color="green">+{val} điểm</Tag>
        },
        { 
            title: 'Thời gian', 
            dataIndex: 'transactionDate', 
            key: 'transactionDate',
            render: (date) => new Date(date).toLocaleString('vi-VN')
        }
    ];

    return (
        <div style={{ padding: 20 }}>
            {/* Header: Tiêu đề và các nút bấm */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><ShoppingCartOutlined /> Lịch sử Giao dịch</h2>
                
                <div style={{ display: 'flex', gap: 10 }}>
                    {/* Nút Xuất Excel */}
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>
                        Xuất Excel
                    </Button>
                    
                    {/* Nút Tạo Giao dịch */}
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Tạo Giao dịch mới
                    </Button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <Table 
                columns={columns} 
                dataSource={transactions} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 8 }} 
            />

            {/* Modal Form Tạo Giao Dịch */}
            <Modal 
                title="Tạo Giao dịch Mua hàng (POS)" 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                footer={null}
            >
                <Card style={{ background: '#f5f5f5', marginBottom: 20, border: '1px dashed #d9d9d9' }}>
                    <p>💡 <i>Hệ thống sẽ tự động tính điểm thưởng dựa trên tỷ lệ quy đổi (10.000đ = 1 điểm).</i></p>
                </Card>

                <Form form={form} layout="vertical" onFinish={handleCreateTransaction}>
                    <Form.Item 
                        name="customerId" 
                        label="Chọn Khách hàng" 
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                        <Select 
                            showSearch
                            placeholder="Nhập tên hoặc SĐT để tìm..."
                            optionFilterProp="children"
                            size="large"
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={customers.map(cus => ({
                                value: cus.id,
                                label: `${cus.name} - ${cus.phone} (Hiện có: ${cus.pointBalance} điểm)`
                            }))}
                        />
                    </Form.Item>

                    <Form.Item 
                        name="amount" 
                        label="Tổng tiền hóa đơn (VNĐ)" 
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <InputNumber 
                            style={{ width: '100%' }} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            min={0}
                            size="large"
                            addonAfter="VNĐ"
                            placeholder="Ví dụ: 500,000"
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
                        Thanh toán & Cộng điểm
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default TransactionPage;