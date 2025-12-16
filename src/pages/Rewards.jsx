import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Gift, Search, Filter, ShoppingBag, CheckCircle } from 'lucide-react';

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Lấy user từ localStorage để có ID
    const storedUser = JSON.parse(localStorage.getItem('user_info'));
    
    if (storedUser) {
        // --- QUAN TRỌNG: Gọi API lấy điểm mới nhất (Giống trang chủ) ---
        axiosClient.get(`/user/profile-summary?id=${storedUser.id}`)
            .then(data => {
                if (data) {
                    setUser(data); // Cập nhật state với dữ liệu mới từ server
                    // Cập nhật ngược lại vào localStorage để đồng bộ
                    localStorage.setItem('user_info', JSON.stringify({ ...storedUser, ...data }));
                }
            })
            .catch(err => {
                console.error("Lỗi tải profile:", err);
                // Nếu lỗi mạng thì dùng tạm localStorage
                setUser(storedUser); 
            });
    }

    // 2. Gọi API lấy danh sách quà
    axiosClient.get('/rewards')
      .then(data => setRewards(data))
      .catch(err => console.error("Lỗi tải quà:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (item) => {
    if (!user) return;
    
    // FIX: Lấy đúng biến giá tiền (pointCost hoặc points)
    const itemPoints = item.pointCost || item.points || 0;
    const userPoints = user.points || 0;

    if (userPoints < itemPoints) {
        alert("Bạn không đủ điểm!");
        return;
    }

    if (window.confirm(`Đổi "${item.name}" với ${itemPoints.toLocaleString()} điểm?`)) {
      try {
        await axiosClient.post('/rewards/redeem', {
          customerId: user.id,
          rewardId: item.id
        });
        alert("🎉 Đổi quà thành công!");
        
        // Trừ điểm ngay lập tức trên giao diện
        const newUser = { ...user, points: userPoints - itemPoints };
        setUser(newUser);
        localStorage.setItem('user_info', JSON.stringify(newUser));
      } catch (error) {
        alert("Lỗi: " + (error.response?.data || "Có lỗi xảy ra"));
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
       {/* HEADER */}
       <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-8 pb-16 px-6 rounded-b-[30px] shadow-lg sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingBag size={24}/> Kho Quà Tặng</h1>
             <div className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">Thành viên: {user?.currentTier || user?.rank || 'Mới'}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xl flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Số điểm của bạn</p>
                {/* Hiển thị điểm */}
                <p className="text-3xl font-extrabold text-blue-600">{(user?.points || 0).toLocaleString()}</p>
             </div>
             <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Gift size={20}/></div>
          </div>
       </div>

       {/* DANH SÁCH QUÀ */}
       <div className="px-5 mt-6 grid grid-cols-2 gap-4">
        {rewards.map((item) => {
            const itemPoints = item.pointCost || item.points || 0; // FIX QUAN TRỌNG
            const userPoints = user?.points || 0;
            const canRedeem = userPoints >= itemPoints;
            
            return (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="h-24 bg-gray-50 flex items-center justify-center mb-2"><Gift size={32} className="text-blue-300"/></div>
                    <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                    <div className="mt-auto flex justify-between items-end">
                        <span className="text-blue-600 font-bold text-sm">{itemPoints.toLocaleString()} <span className="text-[10px]">điểm</span></span>
                        {canRedeem ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-[10px] text-gray-400">Thiếu {itemPoints - userPoints}</span>}
                    </div>
                    <button onClick={() => handleRedeem(item)} disabled={!canRedeem} 
                        className={`w-full py-2 rounded-xl text-xs font-bold mt-2 text-white ${canRedeem ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        Đổi Ngay
                    </button>
                </div>
            )
        })}
       </div>
    </div>
  );
}

export default Rewards;