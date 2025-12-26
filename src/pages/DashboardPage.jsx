import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Avatar, Spin, Typography } from 'antd';
import { 
  UserOutlined, GiftOutlined, DollarOutlined, 
  TrophyOutlined, RiseOutlined, CrownFilled 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosClient from '../api/axiosClient';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, totalPoints: 0, revenue: 0 });
  const [topCustomers, setTopCustomers] = useState([]);
  const [tierData, setTierData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- MÀU SẮC CHUẨN CHO TỪNG HẠNG ---
  const TIER_COLORS = {
    'Mới': '#d9d9d9',       // Xám khói
    'Bạc': '#40a9ff',       // Xanh dương sáng
    'Vàng': '#ffec3d',      // Vàng rực
    'Kim Cương': '#9254de'  // Tím mộng mơ
  };
  // Màu mặc định nếu có hạng lạ
  const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [customersData, transactionsData] = await Promise.all([
        axiosClient.get('/customers'),
        axiosClient.get('/transactions')
      ]);

      // 1. Thống kê
      const totalPoints = customersData.reduce((sum, cus) => sum + (cus.points || 0), 0);
      const totalRevenue = transactionsData.reduce((sum, trans) => sum + (trans.totalAmount || 0), 0);

      setStats({
        totalCustomers: customersData.length,
        totalPoints: totalPoints,
        revenue: totalRevenue
      });

      // 2. Dữ liệu Biểu đồ
      const tierCounts = {};
      customersData.forEach(cus => {
        const tier = cus.tier || 'Mới';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;
      });
      const chartData = Object.keys(tierCounts).map(key => ({ name: key, value: tierCounts[key] }));
      setTierData(chartData);

      // 3. Top 5 VIP
      const sortedCustomers = [...customersData].sort((a, b) => (b.points || 0) - (a.points || 0));
      setTopCustomers(sortedCustomers.slice(0, 5));

    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- CẤU HÌNH CỘT BẢNG TOP 5 (CÓ ICON CÚP) ---
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => {
        if (index === 0) return <CrownFilled style={{ color: '#FFD700', fontSize: 24 }} />; // Vàng
        if (index === 1) return <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 20 }} />; // Bạc
        if (index === 2) return <TrophyOutlined style={{ color: '#CD7F32', fontSize: 20 }} />; // Đồng
        return <span style={{ fontWeight: 'bold', color: '#888' }}>{index + 1}</span>;
      }
    },
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }} icon={<UserOutlined />} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>{text}</span>
        </div>
      )
    },
    {
      title: 'Hạng',
      dataIndex: 'tier',
      key: 'tier',
      align: 'center',
      render: (tier) => {
        let color = 'default';
        if (tier === 'Vàng') color = 'gold';
        if (tier === 'Kim Cương') color = 'purple';
        if (tier === 'Bạc') color = 'cyan';
        return <Tag color={color} style={{ fontWeight: 600 }}>{tier || 'Mới'}</Tag>;
      }
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'points',
      key: 'points',
      align: 'right',
      render: (val) => <b style={{ color: '#389e0d', fontSize: 16 }}>{(val || 0).toLocaleString()}</b>
    }
  ];

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
        <Text type="secondary">Cập nhật số liệu kinh doanh mới nhất hôm nay</Text>
      </div>

      {/* --- PHẦN 1: 3 THẺ THỐNG KÊ (GRADIENT) --- */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Thẻ Khách hàng (Xanh dương) */}
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)', boxShadow: '0 10px 20px rgba(54, 209, 220, 0.3)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Tổng Khách hàng</span>}
              value={stats.totalCustomers} 
              prefix={<UserOutlined style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '50%', marginRight: 8 }} />} 
              valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>

        {/* Thẻ Điểm (Cam vàng) */}
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)', boxShadow: '0 10px 20px rgba(255, 94, 98, 0.3)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Điểm đã cấp</span>}
              value={stats.totalPoints} 
              prefix={<GiftOutlined style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '50%', marginRight: 8 }} />} 
              valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>

        {/* Thẻ Doanh thu (Xanh lá) */}
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', boxShadow: '0 10px 20px rgba(86, 171, 47, 0.3)' }}>
            <Statistic 
              title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Tổng Doanh thu</span>}
              value={stats.revenue} 
              prefix={<DollarOutlined style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: '50%', marginRight: 8 }} />} 
              suffix="đ"
              formatter={(val) => val.toLocaleString('vi-VN')}
              valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* --- PHẦN 2: BIỂU ĐỒ VÀ BẢNG --- */}
      <Row gutter={[24, 24]}>
        {/* Biểu đồ tròn */}
        <Col xs={24} lg={10}>
          <Card 
            title={<><RiseOutlined /> <span style={{ marginLeft: 8 }}>Phân bố Hạng thành viên</span></>}
            bordered={false} 
            style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70} // Tạo biểu đồ Doughnut rỗng ruột nhìn sang hơn
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TIER_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} khách`} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Bảng Top 5 VIP */}
        <Col xs={24} lg={14}>
          <Card 
            title={<><TrophyOutlined style={{ color: '#FFD700' }} /> <span style={{ marginLeft: 8 }}>Top 5 Khách hàng VIP</span></>}
            bordered={false} 
            style={{ borderRadius: 16, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <Table 
              columns={columns} 
              dataSource={topCustomers} 
              rowKey="id" 
              pagination={false} 
              size="middle"
              className="vip-table"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;