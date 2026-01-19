import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
    User, QrCode, RotateCcw, Clock, Award, 
    ChevronRight, Gift, Bell, AlertCircle, X 
} from 'lucide-react';
// 1. IMPORT THƯ VIỆN QR
import { QRCodeCanvas } from 'qrcode.react';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    // 2. STATE ĐỂ BẬT/TẮT MODAL QR
    const [showQrModal, setShowQrModal] = useState(false);
    
    const [summary, setSummary] = useState({
        id: null, name: 'Khách hàng', points: 0, currentTier: 'Thành viên',
        nextTierName: '', nextTierPoints: 0, progress: 0, expiringPoints: 0,
        username: '' // Lưu thêm username để làm mã QR
    });

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestRewards, setLatestRewards] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user_info'));
        if (storedUser && storedUser.id) {
            fetchProfileSummary(storedUser.id);
            fetchLatestRewards();
            fetchNotifications(storedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchProfileSummary = async (userId) => {
        try {
            const data = await axiosClient.get(`/user/profile-summary?id=${userId}`);
            if (data) setSummary(data);
        } catch (error) { console.error("Lỗi tải profile:", error); }
    };

    const fetchNotifications = async (userId) => {
        try {
            const data = await axiosClient.get(`/notifications?userId=${userId}`);
            setNotifications(data);
            const unread = data.filter(n => !n.isRead).length; 
            setUnreadCount(unread);
        } catch (error) { console.error("Lỗi tải thông báo"); }
    };

    const handleToggleNotif = async () => {
        const nextState = !showNotif;
        setShowNotif(nextState);
        if (nextState && unreadCount > 0) {
            try {
                await axiosClient.put(`/notifications/mark-all-read?userId=${summary.id}`);
                setUnreadCount(0); 
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error("Lỗi cập nhật trạng thái thông báo:", error);
            }
        }
    };

    const fetchLatestRewards = async () => {
        try {
            const data = await axiosClient.get('/rewards');
            if (data && Array.isArray(data)) setLatestRewards(data.slice(0, 3));
        } catch (error) { console.error("Lỗi tải ưu đãi:", error); }
    };

    const handleRefresh = (e) => {
        e.stopPropagation();
        if (summary.id) fetchProfileSummary(summary.id);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans relative">
            
            {/* --- 1. HEADER --- */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 pt-10 pb-24 px-6 rounded-b-[40px] relative shadow-lg">
                <div className="flex justify-between items-center mb-6 text-white">
                    <div>
                        <p className="text-blue-100 text-sm mb-0.5">Xin chào,</p>
                        <h1 className="text-2xl font-bold capitalize tracking-wide">{summary.name}</h1>
                    </div>
                    
                    <div className="flex gap-3 relative">
                        <button onClick={handleToggleNotif} className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 relative active:scale-90 transition">
                            <Bell size={20} className="text-white" />
                            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 border-2 border-indigo-700 rounded-full"></span>}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                    <span className="font-bold text-gray-700">Thông báo gần đây</span>
                                    <button onClick={() => setShowNotif(false)}><X size={18} className="text-gray-400"/></button>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400 text-sm">Bạn chưa có thông báo nào</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={`p-4 border-b border-gray-50 flex gap-3 ${!notif.isRead ? 'bg-blue-50/40' : 'opacity-70'}`}>
                                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                                <div className="flex-1">
                                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{notif.title}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2 italic">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <button onClick={() => navigate('/profile')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 overflow-hidden shadow-inner">
                            {summary.avatar ? <img src={summary.avatar} className="w-full h-full object-cover"/> : <User className="text-white" size={20} />}
                        </button>
                    </div>
                </div>

                {/* Thẻ Thành viên */}
                <div onClick={() => navigate('/member-level')} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-blue-100 text-xs font-medium uppercase mb-1">Ví điểm hiện tại</p>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-4xl font-extrabold tracking-tight">{(summary.points || 0).toLocaleString()}</h2>
                                    <button onClick={handleRefresh} className="p-1 hover:bg-white/10 rounded-full transition active:rotate-180"><RotateCcw size={16} className="text-blue-200" /></button>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <Award size={40} className="text-yellow-400 drop-shadow-lg" />
                                <span className="text-[10px] font-bold uppercase mt-1 text-yellow-300">{summary.currentTier}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-blue-100 mb-2 font-medium">
                                <span>{summary.currentTier}</span>
                                {summary.nextTierName !== 'MAX' ? <span>Mục tiêu: <b>{summary.nextTierName}</b></span> : <span className="text-yellow-300 font-bold">CẤP TỐI ĐA</span>}
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(253,224,71,0.4)]" style={{ width: `${(summary.progress || 0) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-blue-300 flex items-center gap-1">Lộ trình thăng hạng <ChevronRight size={10}/></span>
                                {summary.nextTierName !== 'MAX' && <p className="text-[10px] text-blue-200">Cần thêm <b>{(summary.nextTierPoints - summary.points).toLocaleString()}</b> điểm</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. MENU NHANH --- */}
            <div className="px-6 relative z-20 -mt-10 mb-6">
                <div className="bg-white rounded-3xl p-5 shadow-xl shadow-blue-900/5 flex justify-around items-center border border-gray-50">
                    <ActionButton icon={<Gift size={24} />} label="Đổi quà" color="text-pink-500" bgColor="bg-pink-50" onClick={() => navigate('/rewards')}/>
                    <div className="w-px h-8 bg-gray-100"></div>
                    {/* 3. GẮN SỰ KIỆN MỞ MODAL QR */}
                    <ActionButton 
                        icon={<QrCode size={24} />} 
                        label="Mã QR" 
                        color="text-blue-600" 
                        bgColor="bg-blue-50" 
                        onClick={() => setShowQrModal(true)} 
                    />
                    <div className="w-px h-8 bg-gray-100"></div>
                    <ActionButton icon={<Clock size={24} />} label="Lịch sử" color="text-violet-500" bgColor="bg-violet-50" onClick={() => navigate('/history')}/>
                </div>
            </div>

            {/* --- 4. MODAL HIỂN THỊ MÃ QR CÁ NHÂN --- */}
            {showQrModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-slate-50">
                            <h3 className="font-bold text-gray-800">Mã QR của bạn</h3>
                            <button onClick={() => setShowQrModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-10 flex flex-col items-center text-center">
                            <div className="p-4 bg-white border-4 border-blue-50 rounded-3xl shadow-inner mb-6">
                                {/* Dùng ID hoặc Username để nhân viên quét */}
                                <QRCodeCanvas 
                                    value={`CUSTOMER_ID:${summary.id || 'unknown'}`} 
                                    size={200}
                                    level={"H"}
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-2">Đưa mã này cho nhân viên để thực hiện tích điểm hoặc đổi quà nhanh chóng.</p>
                            <h4 className="font-extrabold text-blue-600 tracking-widest uppercase">{summary.name}</h4>
                        </div>
                        <div className="p-4 bg-blue-600 text-center">
                            <button onClick={() => setShowQrModal(false)} className="text-white font-bold text-sm">Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 5. ƯU ĐÃI NỔI BẬT --- */}
            <div className="px-6 pb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Ưu đãi nổi bật</h3>
                    <button onClick={() => navigate('/rewards')} className="text-blue-600 text-xs font-bold">Tất cả</button>
                </div>
                <div className="space-y-4">
                    {latestRewards.map((item) => (
                        <div key={item.id} onClick={() => navigate('/rewards')} className="bg-white p-3 rounded-2xl border border-gray-50 flex gap-4 active:scale-[0.98] transition cursor-pointer shadow-sm hover:shadow-md">
                            <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover"/> : <span className="text-3xl">🎁</span>}
                            </div>
                            <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                                <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-blue-600 font-bold text-sm">{(item.pointCost || 0).toLocaleString()} điểm</span>
                                    <ChevronRight size={14} className="text-gray-300"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ActionButton = ({ icon, label, color, bgColor, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition w-20">
        <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center shadow-sm mb-1`}>{icon}</div>
        <span className="text-[11px] font-bold text-gray-500">{label}</span>
    </button>
);

export default Home;