import React, { useState, useEffect, useRef } from 'react';
import { Card, List, Input, Button, Avatar, Tag, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const InternalChat = () => {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Ref để tự động cuộn xuống tin nhắn mới nhất (nếu muốn)
    const listRef = useRef(null);

    // --- 1. LẤY THÔNG TIN USER ---
    // Xử lý an toàn: Lấy từ localStorage bất kể bạn lưu key là 'user' hay 'user_info'
    const userString = localStorage.getItem('user_info') || localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : { username: 'Guest', role: 'GUEST' };

    // Chuẩn hóa dữ liệu để so sánh
    const currentRole = currentUser.role ? currentUser.role.toUpperCase() : 'GUEST';
    // Một số hệ thống lưu là 'username', số khác lưu là 'name', lấy cả 2 cho chắc
    const currentUsername = currentUser.username || currentUser.name || 'Guest';

    // --- 2. TẢI DỮ LIỆU ---
    const fetchNotes = async () => {
        try {
            const data = await axiosClient.get('/internal-notes');
            // Đảm bảo data luôn là mảng để không lỗi .filter
            setNotes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi chat:", error);
        }
    };

    // --- 3. CƠ CHẾ TỰ ĐỘNG CẬP NHẬT (POLLING) ---
    useEffect(() => {
        fetchNotes(); // Tải ngay khi mở
        const interval = setInterval(fetchNotes, 3000); // Cứ 3 giây tải lại 1 lần
        return () => clearInterval(interval);
    }, []);

    // --- 4. GỬI TIN NHẮN ---
    const handleSend = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            // Gửi nội dung lên Server
            await axiosClient.post('/internal-notes', { content: content });
            setContent('');
            fetchNotes(); // Tải lại ngay lập tức để hiện tin vừa gửi
        } catch (error) {
            message.error('Gửi thất bại');
        } finally {
            setLoading(false);
        }
    };

    // --- 5. LOGIC LỌC TIN NHẮN (QUAN TRỌNG) ---
    const filteredNotes = notes.filter(note => {
        // A. Nếu tôi là ADMIN -> Xem hết
        if (currentRole === 'ADMIN' || currentRole === 'ROLE_ADMIN') {
            return true;
        }

        // B. Nếu tôi là NHÂN VIÊN
        // 1. Xem tin của chính tôi
        const isMyMessage = note.senderName === currentUsername;
        
        // 2. Xem tin của Sếp (Check Role Admin HOẶC tên là 'admin')
        const senderRole = note.senderRole ? note.senderRole.toUpperCase() : '';
        const isAdminMessage = 
            senderRole === 'ADMIN' || 
            senderRole === 'ROLE_ADMIN' || 
            note.senderName === 'admin'; 

        return isMyMessage || isAdminMessage;
    });

    return (
        <Card 
            title={
                <span>
                    💬 Ghi chú nội bộ 
                    <Tag color={currentRole.includes('ADMIN') ? 'red' : 'blue'} style={{ marginLeft: 8 }}>
                        {currentRole.includes('ADMIN') ? 'Admin View' : 'Staff View'}
                    </Tag>
                </span>
            } 
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            // Sửa lỗi bodyStyle deprecated của Antd mới -> dùng styles.body
            styles={{ body: { flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column' } }}
        >
            {/* Vùng hiển thị tin nhắn */}
            <div style={{ flex: 1, overflowY: 'auto' }} ref={listRef}>
                <List
                    itemLayout="horizontal"
                    dataSource={filteredNotes}
                    split={false} // Bỏ đường kẻ ngang cho giống chat
                    locale={{ emptyText: 'Chưa có ghi chú nào' }}
                    renderItem={(item) => {
                        // Logic xác định người gửi để chỉnh giao diện
                        const itemRole = item.senderRole ? item.senderRole.toUpperCase() : '';
                        const isSenderAdmin = itemRole === 'ADMIN' || itemRole === 'ROLE_ADMIN' || item.senderName === 'admin';
                        const isMe = item.senderName === currentUsername;

                        return (
                            <List.Item style={{ padding: '8px 0', border: 'none' }}>
                                <List.Item.Meta
                                    // Avatar: Admin là Robot cam, Người thường là User xanh
                                    avatar={
                                        <Avatar 
                                            style={{ backgroundColor: isSenderAdmin ? '#f56a00' : (isMe ? '#1890ff' : '#87d068') }} 
                                            icon={isSenderAdmin ? <RobotOutlined /> : <UserOutlined />} 
                                        />
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>
                                                <b>{item.senderName}</b> 
                                                {isMe && <Tag color="blue" style={{marginLeft: 8}}>Tôi</Tag>}
                                                {isSenderAdmin && !isMe && <Tag color="orange" style={{marginLeft: 8}}>Admin</Tag>}
                                            </span>
                                            <span style={{ fontSize: '10px', color: '#aaa' }}>
                                                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : ''}
                                            </span>
                                        </div>
                                    }
                                    description={
                                        <div style={{ 
                                            // Tin của mình màu xanh nhạt, tin người khác màu xám
                                            background: isMe ? '#e6f7ff' : '#f5f5f5', 
                                            padding: '8px 12px', 
                                            borderRadius: '10px',
                                            marginTop: '4px',
                                            color: '#333',
                                            border: isMe ? '1px solid #91d5ff' : '1px solid #f0f0f0',
                                            width: 'fit-content'
                                        }}>
                                            {item.content}
                                        </div>
                                    }
                                />
                            </List.Item>
                        );
                    }}
                />
            </div>

            {/* Vùng nhập liệu (Ghim dưới đáy) */}
            <div style={{ marginTop: 10, display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
                <Input 
                    placeholder="Viết ghi chú..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPressEnter={handleSend}
                    disabled={loading}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading}>
                    Gửi
                </Button>
            </div>
        </Card>
    );
};

export default InternalChat;