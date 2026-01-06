import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Avatar, Spin, Typography } from 'antd';
import { 
  UserOutlined, GiftOutlined, DollarOutlined, 
  TrophyOutlined, RiseOutlined, CrownFilled 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosClient from '../api/axiosClient';

// --- IMPORT COMPONENT CHAT ---
import InternalChat from '../components/InternalChat'; 
// -----------------------------

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, totalPoints: 0, revenue: 0 });
  const [topCustomers, setTopCustomers] = useState([]);
  const [tierChartData, setTierChartData] = useState([]);
  const [tierColors, setTierColors] = useState({});
  const [loading, setLoading] = useState(true);

  const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [customersData, transactionsData, tiersData] = await Promise.all([
        axiosClient.get('/customers'),
        axiosClient.get('/transactions').catch(() => []), 
        axiosClient.get('/tiers').catch(() => [])
      ]);

      // Xử lý màu
      const colorMap = {};
      if (Array.isArray(tiersData)) {
        tiersData.forEach(t => {
          colorMap[t.name] = t.colorCode || '#1890ff';
        });
      }
      setTierColors(colorMap);

      // Thống kê
      const totalPoints = customersData.reduce((sum, cus) => sum + (cus.pointBalance || 0), 0);
      const totalRevenue = Array.isArray(transactionsData) 
        ? transactionsData.reduce((sum, trans) => sum + (trans.totalAmount || 0), 0)
        : 0;

      setStats({
        totalCustomers: customersData.length,
        totalPoints: totalPoints,
        revenue: totalRevenue
      });

      // Biểu đồ
      const tierCounts = {};
      customersData.forEach(cus => {
        const tierName = cus.tier || 'Mới';
        tierCounts[tierName] = (tierCounts[tierName] || 0) + 1;
      });

      const chartData = Object.keys(tierCounts).map(key => ({ 
        name: key, 
        value: tierCounts[key] 
      }));
      setTierChartData(chartData);

      // Top 5
      const sortedCustomers = [...customersData].sort((a, b) => (b.pointBalance || 0) - (a.pointBalance || 0));
      setTopCustomers(sortedCustomers.slice(0, 5));

    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '#', key: 'index', width: 60, align: 'center',
      render: (_, __, index) => {
        if (index === 0) return <CrownFilled style={{ color: '#FFD700', fontSize: 24 }} />;
        if (index === 1) return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />;
        if (index === 2) return <TrophyOutlined style={{ color: '#CD7F32', fontSize: 20 }} />;
        return <span style={{ fontWeight: 'bold', color: '#888' }}>{index + 1}</span>;
      }
    },
    {
      title: 'Khách hàng', dataIndex: 'name', key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.avatar} style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} icon={!record.avatar && <UserOutlined />} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{text}</span>
        </div>
      )
    },
    {
      title: 'Hạng', dataIndex: 'tier', key: 'tier', align: 'center',
      render: (tierName) => {
        const color = tierColors[tierName] || 'default';
        return <Tag color={color} style={{ fontWeight: 600 }}>{tierName || 'Mới'}</Tag>;
      }
    },
    {
      title: 'Điểm', dataIndex: 'pointBalance', key: 'pointBalance', align: 'right',
      render: (val) => <b style={{ color: '#389e0d' }}>{(val || 0).toLocaleString()}</b>
    }
  ];

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
        <Text type="secondary">Cập nhật số liệu kinh doanh mới nhất hôm nay</Text>
      </div>

      {/* --- PHẦN 1: THỐNG KÊ --- */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Tổng Khách hàng</span>} value={stats.totalCustomers} prefix={<UserOutlined />} valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Điểm đã cấp</span>} value={stats.totalPoints} prefix={<GiftOutlined />} valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' }}>
            <Statistic title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Doanh thu</span>} value={stats.revenue} prefix={<DollarOutlined />} suffix="đ" formatter={(val) => val.toLocaleString('vi-VN')} valueStyle={{ color: '#fff', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      {/* --- PHẦN 2: BIỂU ĐỒ & TOP VIP --- */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <Card title={<><RiseOutlined /> Phân bố Hạng</>} bordered={false} style={{ borderRadius: 16, height: '100%' }}>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={tierChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {tierChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={tierColors[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} khách`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title={<><TrophyOutlined style={{ color: '#FFD700' }} /> Top 5 VIP</>} bordered={false} style={{ borderRadius: 16, height: '100%' }}>
            <Table columns={columns} dataSource={topCustomers} rowKey="id" pagination={false} size="middle" />
          </Card>
        </Col>
      </Row>

      {/* --- PHẦN 3: GHI CHÚ NỘI BỘ (MỚI THÊM) --- */}
      <Row>
        <Col span={24}>
           {/* Đặt chiều cao cố định để nội dung chat có thể cuộn được */}
           <div style={{ height: '500px' }}>
              <InternalChat />
           </div>
        </Col>
      </Row>

    </div>
  );
};

export default DashboardPage;