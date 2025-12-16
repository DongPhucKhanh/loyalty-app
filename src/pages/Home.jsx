import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
    User, QrCode, RotateCcw, Clock, Award, 
    Zap, ChevronRight, Gift, Star, Tag 
} from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // State lưu thông tin User
    const [summary, setSummary] = useState({
        name: 'Khách hàng',
        points: 0,
        currentTier: 'Mới',
        nextTierPoints: 2000,
        nextTierName: 'Bạc',
        progress: 0,
        recentTransactions: []
    });

    // State lưu danh sách Ưu đãi
    const [latestRewards, setLatestRewards] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user_info'));
        if (storedUser) {
            fetchProfileSummary(storedUser.id);
            fetchLatestRewards();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchProfileSummary = async (userId) => {
        setLoading(true);
        try {
            const data = await axiosClient.get(`/user/profile-summary?id=${userId}`);
            if (data) setSummary(data);
        } catch (error) {
            console.error("Lỗi tải profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestRewards = async () => {
        try {
            const data = await axiosClient.get('/rewards');
            if (data && Array.isArray(data)) {
                const sortedRewards = data.sort((a, b) => b.id - a.id).slice(0, 3);
                setLatestRewards(sortedRewards);
            }
        } catch (error) {
            console.error("Lỗi tải ưu đãi:", error);
        }
    };

    const handleRefresh = () => {
        const storedUser = JSON.parse(localStorage.getItem('user_info'));
        if (storedUser) fetchProfileSummary(storedUser.id);
    };

    const getCardStyle = (index) => {
        const styles = [
            { bg: 'bg-orange-100', text: 'text-orange-500', icon: <Zap size={32} /> },
            { bg: 'bg-blue-100', text: 'text-blue-500', icon: <Gift size={32} /> },
            { bg: 'bg-purple-100', text: 'text-purple-500', icon: <Star size={32} /> },
            { bg: 'bg-green-100', text: 'text-green-500', icon: <Tag size={32} /> },
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            
            {/* --- HEADER (Giữ nguyên) --- */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-10 pb-20 px-6 rounded-b-[40px] relative shadow-lg">
                <div className="flex justify-between items-center mb-6 text-white">
                    <div>
                        <p className="text-blue-100 text-sm mb-0.5">Xin chào,</p>
                        <h1 className="text-2xl font-bold capitalize tracking-wide">{summary.name}</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
                    >
                        <User className="text-white" size={20} />
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/30 rounded-full blur-xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Điểm tích lũy</p>
                                <div className="flex items-center gap-2">
                                    {/* FIX: Thêm ( || 0) để tránh lỗi crash */}
                                    <h2 className="text-4xl font-extrabold tracking-tight">{(summary.points || 0).toLocaleString()}</h2>
                                    <button onClick={handleRefresh} className="p-1 hover:bg-white/10 rounded-full transition">
                                        <RotateCcw size={16} className="text-blue-200" />
                                    </button>
                                </div>
                            </div>
                            <QrCode size={48} className="opacity-90" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-blue-100 mb-1.5 font-medium">
                                <span className="flex items-center gap-1"><Award size={12}/> {summary.currentTier}</span>
                                <span>Mục tiêu: {summary.nextTierName}</span>
                            </div>
                            <div className="w-full bg-black/20 rounded-full h-1.5 backdrop-blur-sm">
                                <div 
                                    className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.6)] transition-all duration-1000 ease-out" 
                                    style={{ width: `${Math.min(100, summary.progress * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MENU NHANH (Giữ nguyên) --- */}
            <div className="px-6 -mt-10 mb-6 relative z-20">
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-blue-900/5 flex justify-around items-center">
                    <ActionButton icon={<Gift size={24} />} label="Đổi quà" color="text-pink-500" bgColor="bg-pink-50" onClick={() => navigate('/rewards')}/>
                    <div className="w-px h-8 bg-gray-100"></div>
                    <ActionButton icon={<QrCode size={24} />} label="Mã QR" color="text-blue-500" bgColor="bg-blue-50" onClick={() => console.log("Show QR")} />
                    <div className="w-px h-8 bg-gray-100"></div>
                    <ActionButton icon={<Clock size={24} />} label="Lịch sử" color="text-violet-500" bgColor="bg-violet-50" onClick={() => navigate('/history')}/>
                </div>
            </div>

            {/* --- ƯU ĐÃI (FIX LỖI CRASH Ở ĐÂY) --- */}
            <div className="px-6 pb-6">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Quà mới cập nhật</h3>
                    <button onClick={() => navigate('/rewards')} className="text-xs text-blue-600 font-semibold hover:underline">Xem tất cả</button>
                </div>
                
                <div className="space-y-4">
                    {latestRewards.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm italic">Chưa có ưu đãi nào mới.</div>
                    ) : (
                        latestRewards.map((item, index) => {
                            const style = getCardStyle(index);
                            
                            // FIX: Dùng item.pointCost (ưu tiên) hoặc item.points, nếu không có thì lấy 0
                            const pointsDisplay = item.pointCost || item.points || 0;

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => navigate('/rewards')} 
                                    className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 flex gap-4 active:scale-[0.98] transition-transform cursor-pointer"
                                >
                                    <div className={`w-20 h-20 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0 ${style.text}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1 py-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                {item.description || 'Đổi ngay món quà giá trị này.'}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            {/* SỬ DỤNG BIẾN ĐÃ FIX */}
                                            <span className={`text-xs font-bold ${style.text}`}>
                                                {pointsDisplay.toLocaleString()} điểm
                                            </span>
                                            <div className={`flex items-center text-xs font-bold ${style.text}`}>
                                                Chi tiết <ChevronRight size={14}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
};

const ActionButton = ({ icon, label, color, bgColor, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-transform w-20">
        <div className={`w-12 h-12 ${bgColor} ${color} rounded-2xl flex items-center justify-center shadow-sm mb-1`}>{icon}</div>
        <span className="text-xs font-semibold text-gray-600">{label}</span>
    </button>
);

export default Home;