import React, { useState, useEffect } from 'react';
import { Card, List, Input, Button, Avatar, Tag, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient'; // Nhớ dùng axiosClient để có Token

const InternalChat = () => {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    // Lấy tên người dùng hiện tại để hiển thị "Tôi"
    const currentUser = JSON.parse(localStorage.getItem('user_info')) || {};

    const fetchNotes = async () => {
        try {
            const data = await axiosClient.get('/internal-notes');
            setNotes(data);
        } catch (error) {
            console.error("Lỗi tải ghi chú:", error);
        }
    };

    useEffect(() => {
        fetchNotes();
        // Có thể dùng setInterval để tự động load tin nhắn mới mỗi 5 giây
        const interval = setInterval(fetchNotes, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            await axiosClient.post('/internal-notes', { content: content });
            setContent('');
            fetchNotes(); // Load lại ngay lập tức
            message.success('Đã gửi ghi chú');
        } catch (error) {
            message.error('Gửi thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card 
            title="💬 Ghi chú nội bộ (Staff Only)" 
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}
        >
            {/* Vùng nhập liệu */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <Input 
                    placeholder="Viết ghi chú cho quản lý..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPressEnter={handleSend}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading}>
                    Gửi
                </Button>
            </div>

            {/* Danh sách tin nhắn */}
            <List
                itemLayout="horizontal"
                dataSource={notes}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={
                                <Avatar 
                                    style={{ backgroundColor: item.senderRole === 'ADMIN' ? '#f56a00' : '#87d068' }} 
                                    icon={item.senderRole === 'ADMIN' ? <RobotOutlined /> : <UserOutlined />} 
                                />
                            }
                            title={
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>
                                        <b>{item.senderName}</b> 
                                        {item.senderName === currentUser.username && <Tag color="blue" style={{marginLeft: 8}}>Tôi</Tag>}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#999' }}>
                                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            }
                            description={
                                <div style={{ 
                                    background: '#f0f2f5', 
                                    padding: '8px 12px', 
                                    borderRadius: '8px',
                                    marginTop: '4px',
                                    color: '#333'
                                }}>
                                    {item.content}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default InternalChat;