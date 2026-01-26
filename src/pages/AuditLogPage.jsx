import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button } from 'antd';
import { ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await axiosClient.get('/audit-logs');
            setLogs(data);
        } catch (error) {
            console.error('Lỗi tải log:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'performedBy',
            key: 'performedBy',
            width: 150,
            render: (text) => <b style={{ color: '#1890ff' }}>{text}</b>
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            width: 200,
            render: (text) => {
                let color = 'default';
                if (text.includes('XÓA')) color = 'red';
                if (text.includes('CỘNG ĐIỂM')) color = 'green';
                if (text.includes('TẠO')) color = 'blue';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Chi tiết',
            dataIndex: 'details',
            key: 'details',
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2><SafetyCertificateOutlined /> Nhật ký hệ thống</h2>
                <Button icon={<ReloadOutlined />} onClick={fetchLogs}>Làm mới</Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
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

export default AuditLogPage;