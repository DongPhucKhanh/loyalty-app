import React from 'react';
import { Typography, Divider } from 'antd';

const { Title, Text } = Typography;

// Dùng React.forwardRef để thư viện in có thể "chụp" được component này
export const Invoice = React.forwardRef(({ data }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} style={{ padding: '40px', background: '#fff', width: '100%', maxWidth: '80mm', margin: '0 auto', fontFamily: 'monospace' }}>
            {/* Header Hóa Đơn */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Title level={4} style={{ margin: 0 }}>LOYALTY STORE</Title>
                <Text style={{ fontSize: '12px' }}>12 Nguyễn Văn Bảo, Gò Vấp, TP.HCM</Text><br/>
                <Text style={{ fontSize: '12px' }}>Hotline: 1900 1234</Text>
            </div>

            <Divider style={{ margin: '10px 0' }} dashed />

            {/* Thông tin giao dịch */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <Text strong>Ngày:</Text>
                <Text>{new Date().toLocaleDateString('vi-VN')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <Text strong>Giờ:</Text>
                <Text>{new Date().toLocaleTimeString('vi-VN')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <Text strong>Mã GD:</Text>
                <Text>#{data.transactionId || 'GD001'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <Text strong>Khách hàng:</Text>
                <Text>{data.customerName}</Text>
            </div>

            <Divider style={{ margin: '10px 0' }} dashed />

            {/* Chi tiết thanh toán */}
            <div style={{ marginBottom: '5px' }}>
                <Text strong>Nội dung:</Text>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Mua hàng tích điểm</Text>
                    <Text>{Number(data.amount).toLocaleString()} đ</Text>
                </div>
            </div>

            <Divider style={{ margin: '10px 0' }} />

            {/* Tổng kết */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <Text>TỔNG TIỀN:</Text>
                <Text>{Number(data.amount).toLocaleString()} đ</Text>
            </div>
            
            <div style={{ marginTop: '15px', background: '#f6ffed', padding: '10px', border: '1px dashed #b7eb8f', textAlign: 'center' }}>
                <Text strong style={{ color: '#389e0d' }}>+ {Number(data.pointsEarned).toLocaleString()} điểm thưởng</Text>
            </div>

            <Divider style={{ margin: '10px 0' }} dashed />

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Text style={{ fontStyle: 'italic', fontSize: '12px' }}>Cảm ơn và hẹn gặp lại!</Text><br/>
                <Text style={{ fontSize: '10px' }}>Powered by Loyalty App</Text>
            </div>
        </div>
    );
});