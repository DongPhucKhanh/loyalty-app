import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, message } from 'antd';
import { HistoryOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import dayjs from 'dayjs';

const EmployeeHistoryPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy username từ localStorage để biết đang là ai
    const user = JSON.parse(localStorage.getItem('user_info')) || {};

    const fetchHistory = async () => {
        if (!user.username) return;
        setLoading(true);
        try {
            // Gọi API vừa tạo bên Backend
            const data = await axiosClient.get(`/employees/${user.username}/history`);
            setLogs(data);
        } catch (error) {
            message.error('Không thể tải lịch sử thao tác!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 200,
            render: (text) => (
                <span>
                    <ClockCircleOutlined style={{ marginRight: 8, color: '#999' }} />
                    {dayjs(text).format('DD/MM/YYYY HH:mm:ss')}
                </span>
            ),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            width: 150,
            render: (action) => {
                let color = 'blue';
                if (action.includes('CỘNG')) color = 'green';
                if (action.includes('TRỪ') || action.includes('DEDUCT')) color = 'red';
                return <Tag color={color}>{action}</Tag>;
            },
        },
        {
            title: 'Chi tiết / Khách hàng liên quan',
            dataIndex: 'details',
            key: 'details',
            // Log của bạn lưu dạng: "Cộng 100 điểm cho KH: 0987..."
            // Nên hiển thị trực tiếp là đủ hiểu
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 20 }}>
                <HistoryOutlined /> Lịch sử thao tác của tôi
            </h2>
            <Card variant="borderless" style={{ borderRadius: 10 }}>
                <Table 
                    columns={columns} 
                    dataSource={logs} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default EmployeeHistoryPage;