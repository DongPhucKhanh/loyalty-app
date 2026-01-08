import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ChevronLeft, Award, CheckCircle, Lock, Zap, Star } from 'lucide-react';

const MemberLevelPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [tiers, setTiers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Lấy user ID từ localStorage
            const storedUser = JSON.parse(localStorage.getItem('user_info'));
            if (!storedUser || !storedUser.id) {
                navigate('/login');
                return;
            }

            // 2. Gọi API lấy thông tin Profile và Danh sách Hạng (nếu chưa có API public/tiers thì dùng tạm list cứng hoặc tạo thêm API)
            // Ở đây mình giả định bạn đã thêm API /public/tiers như hướng dẫn trước, 
            // nếu chưa thì mình sẽ fallback về list cứng ở dưới để code không lỗi.
            
            let tiersData = [];
            try {
                tiersData = await axiosClient.get('/tiers'); // Hoặc /public/tiers
            } catch (e) {
                // Fallback dữ liệu cứng nếu chưa có API lấy danh sách hạng
                tiersData = [
                    { name: 'Mới', minPoint: 0, benefits: ['Tích điểm 1%', 'Đổi quà cơ bản'] },
                    { name: 'Bạc', minPoint: 2000, benefits: ['Tích điểm 1.2%', 'Voucher sinh nhật'] },
                    { name: 'Vàng', minPoint: 5000, benefits: ['Tích điểm 1.5%', 'Hoàn tiền 5%', 'Priority'] },
                    { name: 'Kim Cương', minPoint: 10000, benefits: ['Tích điểm 2%', 'VIP Lounge', 'Quà lễ tết'] }
                ];
            }

            // Sắp xếp hạng tăng dần
            tiersData.sort((a, b) => a.minPoint - b.minPoint);
            setTiers(tiersData);

            // Lấy thông tin chi tiết user (để có progress chính xác)
            const profileData = await axiosClient.get(`/user/profile-summary?id=${storedUser.id}`);
            setUser(profileData);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy quyền lợi (Nếu DB chưa có cột benefits, dùng hàm này map tạm)
    const getBenefits = (tierName, dbBenefits) => {
        if (dbBenefits && dbBenefits.length > 0) return dbBenefits;
        // Map cứng nếu DB không trả về
        switch (tierName) {
            case 'Mới': return ['Tích điểm cơ bản (1%)', 'Tham gia đổi quà'];
            case 'Bạc': return ['Tích điểm hệ số x1.1', 'Voucher sinh nhật 50k', 'Ưu đãi ngày hội viên'];
            case 'Vàng': return ['Tích điểm hệ số x1.2', 'Voucher sinh nhật 100k', 'Miễn phí vận chuyển', 'Hoàn tiền 2%'];
            case 'Kim Cương': return ['Tích điểm hệ số x1.5', 'Quà Tết cao cấp', 'Phòng chờ VIP', 'Support 24/7'];
            default: return ['Quyền lợi đang cập nhật'];
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-blue-600 text-2xl">Wait...</div></div>;

    // Tìm vị trí hạng hiện tại trong mảng
    const currentTierIndex = tiers.findIndex(t => t.name === user.currentTier);

    return (
        <div className="min-h-screen bg-slate-50 pb-10 font-sans">
            {/* --- HEADER --- */}
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20">
                <button onClick={() => navigate('/')} className="mr-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Cấp độ & Quyền lợi</h1>
            </div>

            <div className="p-4 max-w-lg mx-auto">
                
                {/* 1. CARD CẤP ĐỘ HIỆN TẠI */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Award size={100}/></div>
                    
                    <div className="relative z-10">
                        <p className="text-indigo-200 text-xs font-bold uppercase mb-1 tracking-wider">Cấp độ hiện tại</p>
                        <h2 className="text-4xl font-extrabold mb-4">{user.currentTier}</h2>
                        
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10">
                            <div className="flex justify-between text-xs font-semibold mb-2 text-indigo-100">
                                <span>Điểm tích lũy</span>
                                <span>{user.points.toLocaleString()} điểm</span>
                            </div>
                            
                            {/* Thanh tiến trình */}
                            <div className="w-full bg-black/20 rounded-full h-3 mb-3">
                                <div 
                                    className="bg-yellow-400 h-3 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] transition-all duration-1000" 
                                    style={{ width: `${(user.progress || 0) * 100}%` }}
                                ></div>
                            </div>

                            {user.nextTierName !== 'MAX' ? (
                                <p className="text-xs text-indigo-200">
                                    Còn thiếu <b className="text-white">{(user.nextTierPoints - user.points).toLocaleString()} điểm</b> để lên hạng <b>{user.nextTierName}</b>
                                </p>
                            ) : (
                                <p className="text-xs text-yellow-300 font-bold flex items-center gap-1">
                                    <Star size={12} fill="currentColor"/> Bạn đã đạt cấp độ tối thượng!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. TIMELINE LỘ TRÌNH THĂNG HẠNG */}
                <h3 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-yellow-500" size={20}/> Lộ trình thăng hạng
                </h3>

                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
                    {tiers.map((tier, index) => {
                        const isUnlocked = index <= currentTierIndex;
                        const isCurrent = index === currentTierIndex;

                        return (
                            <div key={index} className="ml-6 relative">
                                {/* Dấu chấm tròn trên timeline */}
                                <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${
                                    isCurrent ? 'bg-blue-600 border-blue-100 text-white scale-110 shadow-lg' :
                                    isUnlocked ? 'bg-green-500 border-white text-white' :
                                    'bg-gray-100 border-white text-gray-300'
                                }`}>
                                    {isUnlocked ? <CheckCircle size={14} /> : <Lock size={14} />}
                                </div>

                                {/* Nội dung thẻ */}
                                <div className={`p-4 rounded-2xl border transition-all ${
                                    isCurrent ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-100' :
                                    isUnlocked ? 'bg-white border-gray-200' :
                                    'bg-gray-50 border-gray-100 opacity-70 grayscale-[0.5]'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className={`font-bold text-base ${isCurrent ? 'text-blue-700' : 'text-gray-800'}`}>
                                                {tier.name}
                                            </h4>
                                            {isCurrent && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">Hiện tại</span>}
                                        </div>
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {tier.minPoint.toLocaleString()} điểm
                                        </span>
                                    </div>

                                    {/* Danh sách quyền lợi */}
                                    <ul className="space-y-2 mt-3">
                                        {getBenefits(tier.name, tier.benefits).map((benefit, i) => (
                                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                                <CheckCircle size={14} className={`mt-0.5 shrink-0 ${isUnlocked ? 'text-green-500' : 'text-gray-400'}`} />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MemberLevelPage;