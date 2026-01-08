import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ChatAIWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Xin chào! Em là trợ lý ảo của DongPhucKhanh. Anh/Chị cần em hỗ trợ gì về điểm thưởng và quà tặng không ạ?", isAi: true }
    ]);
    
    const scrollRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, isAi: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Lấy ID khách hàng từ LocalStorage để AI biết khách hàng là ai
            const userStr = localStorage.getItem('user_info');
            const customerId = userStr ? JSON.parse(userStr).id : null;

            // Gọi API Backend đã viết ở bước trước
            const response = await axiosClient.post(`/chat/ask?customerId=${customerId}`, {
                message: input
            });

            const aiMsg = { text: response, isAi: true }; // Giả sử API trả về chuỗi trực tiếp
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Dạ, hệ thống đang bận, Anh/Chị thử lại sau nhé!", isAi: true }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 font-sans">
            {/* 1. Nút bong bóng chat */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all active:scale-90 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* 2. Cửa sổ chat */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] shadow-2xl rounded-3xl flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold">Hỗ trợ khách hàng AI</h4>
                                <p className="text-[10px] opacity-80">Trực tuyến 24/7</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nội dung chat */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.isAi ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex gap-2 max-w-[80%] ${m.isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.isAi ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                                        {m.isAi ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-xs shadow-sm ${m.isAi ? 'bg-white text-gray-700 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl shadow-sm">
                                    <Loader2 size={16} className="animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ô nhập tin nhắn */}
                    <div className="p-4 bg-white border-t flex gap-2 items-center">
                        <input 
                            className="flex-1 bg-gray-100 border-none outline-none px-4 py-2.5 rounded-full text-xs"
                            placeholder="Nhập câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            disabled={loading || !input.trim()}
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white p-2.5 rounded-full disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatAIWidget;