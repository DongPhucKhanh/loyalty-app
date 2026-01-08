import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
    Gift, ShoppingBag, CheckCircle, AlertTriangle, 
    Loader, Ticket, Clock, CheckCircle2, XCircle 
} from 'lucide-react';

function Rewards() {
    const [activeTab, setActiveTab] = useState('available'); // 'available' hoặc 'my-vouchers'
    const [rewards, setRewards] = useState([]);
    const [myVouchers, setMyVouchers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]); // Tải lại dữ liệu khi chuyển tab

    const fetchData = async () => {
        try {
            const userStr = localStorage.getItem('user_info');
            if (userStr) {
                const storedUser = JSON.parse(userStr);
                
                // 1. Tải Profile để cập nhật điểm mới nhất
                const profileData = await axiosClient.get(`/user/profile-summary?id=${storedUser.id}`);
                setUser(profileData);
                localStorage.setItem('user_info', JSON.stringify({ ...storedUser, ...profileData }));

                // 2. Tải dữ liệu theo Tab
                if (activeTab === 'available') {
                    const rewardsData = await axiosClient.get('/rewards');
                    setRewards(rewardsData);
                } else {
                    const vouchersData = await axiosClient.get(`/redemptions/my-vouchers?userId=${storedUser.id}`);
                    setMyVouchers(vouchersData);
                }
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (item) => {
        const itemPoints = item.pointCost || 0;
        const userPoints = user?.points || 0;

        if (userPoints < itemPoints) {
            alert("Bạn không đủ điểm!");
            return;
        }

        if (window.confirm(`Xác nhận dùng ${itemPoints.toLocaleString()} điểm để đổi "${item.name}"?`)) {
            try {
                // Gọi API RedemptionController đã viết ở Backend
                await axiosClient.post(`/redemptions/redeem?customerId=${user.id}&rewardId=${item.id}`);
                
                alert("🎉 Đổi quà thành công! Đang chuyển sang kho quà của bạn.");
                
                // Cập nhật điểm ngay tại local
                setUser(prev => ({ ...prev, points: prev.points - itemPoints }));
                
                // Chuyển sang tab "Quà của tôi" để xem voucher
                setActiveTab('my-vouchers');
            } catch (error) {
                alert("Lỗi: " + (error.response?.data || "Không thể đổi quà"));
            }
        }
    };

    // Hàm render Tag trạng thái cho Voucher
    const renderStatus = (status) => {
        switch (status) {
            case 'UNUSED': 
                return <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200"><Clock size={10}/> Chưa dùng</span>;
            case 'USED': 
                return <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"><CheckCircle2 size={10}/> Đã dùng</span>;
            case 'EXPIRED': 
                return <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200"><XCircle size={10}/> Hết hạn</span>;
            default: return null;
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader className="animate-spin text-blue-500"/></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* HEADER & TỔNG ĐIỂM */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-8 pb-12 px-6 rounded-b-[40px] shadow-lg sticky top-0 z-20">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingBag size={22}/> Ưu đãi</h1>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-white/30">
                        {user?.currentTier || 'Thành viên'}
                    </div>
                </div>
                
                <div className="bg-white rounded-3xl p-5 shadow-2xl flex justify-between items-center border border-white/50">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-1">Ví điểm khả dụng</p>
                        <p className="text-4xl font-black text-blue-600 tracking-tighter">{(user?.points || 0).toLocaleString()}</p>
                    </div>
                    <div className="h-14 w-14 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                        <Gift size={28}/>
                    </div>
                </div>
            </div>

            {/* TAB SWITCHER */}
            <div className="flex px-6 mt-[-20px] relative z-30">
                <div className="bg-white p-1.5 rounded-2xl shadow-md flex w-full border border-gray-100">
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'available' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500'}`}
                    >
                        Đổi ưu đãi
                    </button>
                    <button 
                        onClick={() => setActiveTab('my-vouchers')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'my-vouchers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-500'}`}
                    >
                        Quà của tôi
                    </button>
                </div>
            </div>

            {/* NỘI DUNG THEO TAB */}
            <div className="px-5 mt-8">
                {activeTab === 'available' ? (
                    /* TAB 1: DANH SÁCH QUÀ CÓ THỂ ĐỔI */
                    <div className="grid grid-cols-2 gap-4">
                        {rewards.map((item) => {
                            const canRedeem = (user?.points || 0) >= (item.pointCost || 0);
                            return (
                                <div key={item.id} className="bg-white p-3 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition active:scale-[0.98]">
                                    <div className="h-28 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-4xl shadow-inner">🎁</div>
                                    <h3 className="font-bold text-xs mb-1 text-gray-800 line-clamp-2 px-1">{item.name}</h3>
                                    <p className="text-[10px] text-gray-400 px-1 mb-3">Tốn {item.pointCost} điểm</p>
                                    
                                    <button 
                                        onClick={() => handleRedeem(item)} 
                                        disabled={!canRedeem} 
                                        className={`mt-auto w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                            canRedeem 
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-100 active:bg-blue-700' 
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {canRedeem ? 'Đổi Ngay' : 'Thiếu điểm'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    /* TAB 2: LỊCH SỬ ĐỔI QUÀ / QUÀ CỦA TÔI */
                    <div className="space-y-4">
                        {myVouchers.length === 0 ? (
                            <div className="text-center py-16 opacity-40">
                                <Ticket size={48} className="mx-auto mb-2 text-gray-300"/>
                                <p className="text-sm font-medium">Bạn chưa đổi quà nào đâu!</p>
                            </div>
                        ) : (
                            myVouchers.map(v => (
                                <div key={v.id} className={`bg-white p-4 rounded-3xl border flex gap-4 transition-all ${v.status !== 'UNUSED' ? 'grayscale-[0.5] opacity-70' : 'shadow-md shadow-slate-200 border-blue-50'}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${v.status === 'UNUSED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <Ticket size={28} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-sm text-gray-800 truncate pr-2">{v.reward.name}</h4>
                                            {renderStatus(v.status)}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[10px] font-mono font-bold text-blue-500 uppercase">Mã: {v.voucherCode}</p>
                                            <p className="text-[9px] text-gray-400 flex items-center gap-1">
                                                Hạn dùng: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Rewards;