import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Avatar, Space } from 'antd';
import { MessageOutlined, SendOutlined, RobotOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient'; // Đảm bảo đường dẫn import axios đúng với dự án của bạn

const ChatAIWidget = () => {
    // --- STATE QUẢN LÝ ---
    const [isOpen, setIsOpen] = useState(false); // Mở/Đóng khung chat
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: 'Xin chào! Mình là Trợ lý AI Loyalty. Mình có thể giúp bạn tra cứu điểm, hạng thành viên và gợi ý đổi quà. Bạn cần giúp gì không?', 
            sender: 'bot' 
        }
    ]);
    
    // Ref để tự động cuộn xuống tin nhắn cuối
    const messagesEndRef = useRef(null);

    // --- LẤY ID USER TỪ LOCAL STORAGE (Quan trọng) ---
    // Giả sử khi Login bạn lưu: localStorage.setItem('user', JSON.stringify(data));
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    // Nếu chưa đăng nhập, customerId sẽ là null (Backend đã xử lý được trường hợp này rồi)
    const customerId = user ? user.id : null; 

    // Hàm cuộn xuống cuối
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    // --- XỬ LÝ GỬI TIN NHẮN ---
    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // 1. Hiện tin nhắn người dùng ngay lập tức (cho mượt)
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setLoading(true);

        try {
            // 2. Gọi API Backend (Controller bạn vừa sửa)
            const res = await axiosClient.post('/chat/ask', {
                message: userMsg.text,
                customerId: customerId // Gửi ID xuống để AI biết ai đang hỏi
            });

            // 3. Hiện câu trả lời từ Gemini
            const botMsg = { id: Date.now() + 1, text: res.response, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = { id: Date.now() + 1, text: 'Hệ thống đang bận, vui lòng thử lại sau!', sender: 'bot' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
            {/* NÚT TRÒN MỞ CHAT */}
            {!isOpen && (
                <Button 
                    type="primary" 
                    shape="circle" 
                    icon={<MessageOutlined style={{ fontSize: 24 }} />} 
                    size="large"
                    style={{ width: 60, height: 60, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setIsOpen(true)}
                />
            )}

            {/* CỬA SỔ CHAT */}
            {isOpen && (
                <Card 
                    style={{ width: 360, height: 520, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', borderRadius: 16 }}
                    // Sửa lỗi bodyStyle deprecated: Dùng styles.body
                    styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
                    title={<Space><RobotOutlined style={{ color: '#1890ff' }} /> <span style={{ fontWeight: 600 }}>Trợ lý AI Loyalty</span></Space>}
                    extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
                >
                    {/* VÙNG HIỂN THỊ TIN NHẮN */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f5f7fa' }}>
                        {/* Dùng map thay vì List để tránh warning deprecated */}
                        {messages.map((item) => (
                             <div key={item.id} style={{ 
                                display: 'flex', 
                                justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start',
                                marginBottom: 12
                            }}>
                                {item.sender === 'bot' && (
                                    <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#fff', color: '#1890ff', marginRight: 8, border: '1px solid #d9d9d9' }} />
                                )}
                                
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '10px 14px',
                                    borderRadius: 16,
                                    borderTopLeftRadius: item.sender === 'bot' ? 4 : 16,
                                    borderTopRightRadius: item.sender === 'user' ? 4 : 16,
                                    background: item.sender === 'user' ? '#1890ff' : '#fff',
                                    color: item.sender === 'user' ? '#fff' : '#333',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    whiteSpace: 'pre-wrap', // Giữ định dạng xuống dòng
                                    fontSize: 14,
                                    lineHeight: 1.5
                                }}>
                                    {item.text}
                                </div>
                                
                                {item.sender === 'user' && (
                                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginLeft: 8 }} />
                                )}
                            </div>
                        ))}
                        
                        {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 40, marginBottom: 10 }}>
                                <div style={{ width: 6, height: 6, background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite' }}></div>
                                <div style={{ width: 6, height: 6, background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                                <div style={{ width: 6, height: 6, background: '#999', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* VÙNG NHẬP LIỆU */}
                    <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                        <Input 
                            placeholder="Nhập câu hỏi...." 
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={loading}
                            style={{ borderRadius: 20 }}
                        />
                        <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChatAIWidget;