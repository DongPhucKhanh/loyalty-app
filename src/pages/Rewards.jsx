import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Gift, ShoppingBag, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Lấy User ID từ LocalStorage
      const userStr = localStorage.getItem('user_info');
      console.log(">>> [DEBUG] LocalStorage user_info:", userStr); // Debug 1

      if (userStr) {
        const storedUser = JSON.parse(userStr);
        
        // 2. Gọi API lấy điểm mới nhất để đảm bảo chính xác
        try {
            const profileData = await axiosClient.get(`/user/profile-summary?id=${storedUser.id}`);
            if (profileData) {
                console.log(">>> [DEBUG] Dữ liệu Profile mới nhất:", profileData); // Debug 2
                setUser(profileData);
                // Cập nhật ngược lại LocalStorage để đồng bộ
                localStorage.setItem('user_info', JSON.stringify({ ...storedUser, ...profileData }));
            }
        } catch (err) {
            console.error(">>> [ERROR] Lỗi tải profile (dùng tạm cache cũ):", err);
            setUser(storedUser); // Nếu lỗi mạng thì dùng tạm dữ liệu cũ
        }
      }

      // 3. Tải danh sách quà
      const rewardsData = await axiosClient.get('/rewards');
      console.log(">>> [DEBUG] Danh sách quà tải về:", rewardsData); // Debug 3
      setRewards(rewardsData);

    } catch (err) {
      console.error("Lỗi chung khi tải trang:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- HÀM XỬ LÝ ĐỔI QUÀ (CÓ LOG CHI TIẾT) ---
  const handleRedeem = async (item) => {
    console.clear(); // Xóa console cũ cho dễ nhìn
    console.log("%c=== BẮT ĐẦU QUÁ TRÌNH ĐỔI QUÀ ===", "color: blue; font-weight: bold; font-size: 14px;");

    // 1. KIỂM TRA DỮ LIỆU ĐẦU VÀO
    console.log("1. Thông tin Người dùng (User):", user);
    console.log("2. Thông tin Món quà (Item):", item);

    // Kiểm tra ID cụ thể
    const customerId = user?.id;
    const rewardId = item?.id;

    console.log(`%c>>> CHECK ID: CustomerID = ${customerId} | RewardID = ${rewardId}`, "color: orange; font-weight: bold;");

    if (!customerId) {
        console.error("❌ LỖI: Không tìm thấy Customer ID. User có thể bị null hoặc chưa đăng nhập.");
        alert("Lỗi: Không tìm thấy thông tin tài khoản. Vui lòng Đăng xuất và Đăng nhập lại!");
        return;
    }

    if (!rewardId) {
        console.error("❌ LỖI: Không tìm thấy Reward ID. Món quà này bị lỗi dữ liệu.");
        alert("Món quà này bị lỗi, vui lòng chọn món khác!");
        return;
    }

    // 2. KIỂM TRA ĐIỂM SỐ
    const itemPoints = item.pointCost || item.points || 0;
    const userPoints = user.points || 0;

    console.log(`>>> CHECK ĐIỂM: Khách có ${userPoints} - Quà giá ${itemPoints}`);

    if (userPoints < itemPoints) {
        alert(`Bạn còn thiếu ${itemPoints - userPoints} điểm nữa!`);
        return;
    }

    // 3. GỬI YÊU CẦU LÊN SERVER
    if (window.confirm(`Xác nhận đổi "${item.name}" với ${itemPoints.toLocaleString()} điểm?`)) {
      try {
        const payload = {
            customerId: customerId,
            rewardId: rewardId
        };
        console.log(">>> [POST] Đang gửi Payload đi:", payload);

        await axiosClient.post('/rewards/redeem', payload);
        
        console.log("✅ THÀNH CÔNG: Đổi quà ok!");
        alert("🎉 Đổi quà thành công! Hãy kiểm tra túi đồ.");
        
        // 4. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC
        const newUserState = { ...user, points: userPoints - itemPoints };
        setUser(newUserState);
        
        // Cập nhật localStorage để nếu F5 vẫn thấy điểm mới
        const oldStorage = JSON.parse(localStorage.getItem('user_info')) || {};
        localStorage.setItem('user_info', JSON.stringify({ ...oldStorage, points: newUserState.points }));

      } catch (error) {
        console.error("❌ THẤT BẠI: Lỗi từ Server trả về:", error);
        console.log("Chi tiết lỗi:", error.response?.data);
        alert("Lỗi: " + (error.response?.data || "Có lỗi xảy ra, vui lòng thử lại"));
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
       {/* HEADER */}
       <div className="bg-gradient-to-br from-blue-600 to-indigo-700 pt-8 pb-16 px-6 rounded-b-[30px] shadow-lg sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
             <h1 className="text-xl font-bold text-white flex items-center gap-2"><ShoppingBag size={24}/> Kho Quà Tặng</h1>
             <div className="bg-white/20 px-3 py-1 rounded-full text-xs text-white">
                {user?.currentTier || 'Thành viên'}
             </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xl flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Số điểm của bạn</p>
                <p className="text-3xl font-extrabold text-blue-600">{(user?.points || 0).toLocaleString()}</p>
             </div>
             <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Gift size={20}/></div>
          </div>
       </div>

       {/* DANH SÁCH QUÀ */}
       <div className="px-5 mt-6 grid grid-cols-2 gap-4">
        {rewards.length === 0 && <div className="col-span-2 text-center text-gray-400 py-10">Chưa có món quà nào.</div>}
        
        {rewards.map((item) => {
            const itemPoints = item.pointCost || item.points || 0;
            const userPoints = user?.points || 0;
            const canRedeem = userPoints >= itemPoints;
            
            return (
                <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition active:scale-[0.98]">
                    <div className="h-24 bg-gray-50 rounded-xl flex items-center justify-center mb-2 text-4xl">🎁</div>
                    <h3 className="font-bold text-sm mb-1 text-gray-800 line-clamp-1">{item.name}</h3>
                    
                    <div className="mt-auto flex justify-between items-end mb-3">
                        <span className="text-blue-600 font-bold text-sm">{itemPoints.toLocaleString()} <span className="text-[10px]">điểm</span></span>
                        {canRedeem 
                            ? <CheckCircle size={16} className="text-green-500"/> 
                            : <AlertTriangle size={16} className="text-gray-300"/>
                        }
                    </div>

                    <button 
                        onClick={() => handleRedeem(item)} 
                        disabled={!canRedeem} 
                        className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                            canRedeem 
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                            : 'bg-gray-300 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {canRedeem ? 'Đổi Ngay' : 'Thiếu điểm'}
                    </button>
                </div>
            )
        })}
       </div>
    </div>
  );
}

export default Rewards;