import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Clock, ShoppingCart, Gift } from 'lucide-react';

const History = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const user = JSON.parse(localStorage.getItem('user_info'));
            if (!user) return;

            try {
                // --- SỬA LỖI Ở ĐÂY ---
                // Cũ (Sai): axiosClient.get(`/rewards/history/${user.id}`) -> Chỉ lấy lịch sử đổi quà
                // Mới (Đúng): Lấy toàn bộ lịch sử giao dịch (cả cộng và trừ)
                const data = await axiosClient.get(`/transactions/customer/${user.id}`);
                setTransactions(data);
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải lịch sử...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 shadow-sm z-10">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={24} className="text-blue-600"/> Lịch Sử Giao Dịch
                </h1>
            </div>

            {/* Danh sách giao dịch */}
            <div className="p-4 space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">Chưa có giao dịch nào.</div>
                ) : (
                    transactions.map((item) => {
                        // Xác định loại giao dịch để hiển thị màu sắc
                        // EARN hoặc PRODUCT: Tích điểm (Xanh)
                        // REDEEM: Đổi quà (Đỏ)
                        const isEarn = item.type === 'EARN' || item.type === 'PRODUCT';
                        const isRedeem = item.type === 'REDEEM';

                        return (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                {/* Bên trái: Icon và Thông tin */}
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarn ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                        {isEarn ? <ShoppingCart size={20} /> : <Gift size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">
                                            {isEarn ? 'Mua hàng tích điểm' : 'Đổi quà tặng'}
                                        </h4>
                                        <p className="text-xs text-gray-400">
                                            {new Date(item.transactionDate).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                {/* Bên phải: Số điểm biến động */}
                                <div className="text-right">
                                    {isEarn ? (
                                        <span className="block font-bold text-green-600 text-lg">+{item.pointsEarned}</span>
                                    ) : (
                                        <span className="block font-bold text-red-500 text-lg">-{item.pointsUsed}</span>
                                    )}
                                    <span className="text-[10px] text-gray-400 font-medium">điểm</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default History;