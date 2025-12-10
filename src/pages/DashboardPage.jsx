import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Table, Tag } from 'antd';
import { UserOutlined, GiftOutlined, DollarCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axiosClient from '../api/axiosClient';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await axiosClient.get('/admin/dashboard/stats');
                setStats(data);

                // Chuyển đổi dữ liệu Map từ Java sang mảng cho Recharts
                if (data.tierStats) {
                    const formattedData = Object.keys(data.tierStats).map(key => ({
                        name: key,
                        value: data.tierStats[key]
                    }));
                    setChartData(formattedData);
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Màu sắc cho biểu đồ tròn (Tương ứng các hạng)
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div style={{textAlign: 'center', marginTop: 100}}><Spin size="large"/></div>;

    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Tổng quan hệ thống</h2>
            
            {/* 1. CÁC THẺ SỐ LIỆU */}
            <Row gutter={16} style={{ marginBottom: 30 }}>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic title="Khách hàng" value={stats?.totalCustomers || 0} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#fff7e6' }}>
                        <Statistic title="Điểm đã cấp" value={stats?.totalPointsIssued || 0} prefix={<GiftOutlined />} groupSeparator="." valueStyle={{ color: '#fa8c16' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic title="Doanh thu" value={stats?.totalRevenue || 0} precision={0} suffix="đ" prefix={<DollarCircleOutlined />} groupSeparator="." valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
            </Row>

            {/* 2. BIỂU ĐỒ & TOP KHÁCH HÀNG */}
            <Row gutter={24}>
                {/* Biểu đồ tròn: Tỷ lệ hạng thành viên */}
                <Col span={12}>
                    <Card title="Phân bố Hạng Thành viên" bordered={false} style={{ height: '100%' }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60} // Tạo biểu đồ Donut
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value} khách`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Bảng Top Khách hàng VIP */}
                <Col span={12}>
                    <Card title={<><TrophyOutlined style={{color: 'gold'}}/> Top 5 Khách hàng VIP</>} bordered={false} style={{ height: '100%' }}>
                        <Table 
                            dataSource={stats?.topCustomers || []} 
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Tên', dataIndex: 'name', key: 'name', render: t => <b>{t}</b> },
                                { title: 'Hạng', dataIndex: 'tier', key: 'tier', render: t => <Tag color="blue">{t}</Tag> },
                                { title: 'Điểm', dataIndex: 'pointBalance', key: 'point', render: p => <b style={{color: 'green'}}>{p}</b> },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;