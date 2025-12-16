import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
    User, Mail, Phone, Edit3, Save, X, 
    Award, ChevronLeft, LogOut, Camera 
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State lưu thông tin hiển thị
    const [profile, setProfile] = useState({
        id: '',
        name: '',
        phone: '',
        email: '',
        points: 0,
        tier: 'Mới'
    });

    // State lưu dữ liệu form khi chỉnh sửa
    const [editForm, setEditForm] = useState({});

    // Cấu hình các mốc hạng (Cần khớp với logic Backend)
    const TIERS = [
        { name: 'Mới', min: 0 },
        { name: 'Bạc', min: 2000 },
        { name: 'Vàng', min: 5000 },
        { name: 'Kim Cương', min: 10000 }
    ];

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            // 1. Lấy thông tin cơ bản từ LocalStorage
            const storedUser = JSON.parse(localStorage.getItem('user_info'));
            if (!storedUser) {
                navigate('/login');
                return;
            }

            // 2. Gọi API để lấy điểm số và hạng mới nhất
            // API này trả về: { name, points, currentTier, ... }
            const res = await axiosClient.get(`/user/profile-summary?id=${storedUser.id}`);
            
            // 3. Hợp nhất dữ liệu
            const userData = {
                id: storedUser.id,
                name: res.name || storedUser.name,
                phone: storedUser.phone || '', 
                email: storedUser.email || '', // Email có thể null
                points: res.points,
                tier: res.currentTier
            };
            
            setProfile(userData);
            setEditForm(userData);
        } catch (error) {
            console.error("Lỗi tải hồ sơ:", error);
            // Nếu lỗi API, vẫn hiển thị thông tin cũ từ LocalStorage để không bị trắng trang
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý cập nhật thông tin
    const handleUpdate = async () => {
        try {
            // Gọi API PUT /customers/{id}
            await axiosClient.put(`/customers/${profile.id}`, {
                name: editForm.name,
                email: editForm.email,
                phone: profile.phone // Giữ nguyên SĐT không cho sửa
            });
            
            // Cập nhật State
            const newProfile = { ...profile, ...editForm };
            setProfile(newProfile);
            
            // Cập nhật cả LocalStorage để đồng bộ các trang khác
            const storedUser = JSON.parse(localStorage.getItem('user_info'));
            localStorage.setItem('user_info', JSON.stringify({ ...storedUser, ...editForm }));
            
            setIsEditing(false);
            alert("Cập nhật thành công!");
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data || error.message));
        }
    };

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        if(window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
            localStorage.removeItem('user_info');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    // Logic tính toán thanh tiến trình
    const getNextTier = () => {
        return TIERS.find(t => t.min > profile.points);
    };

    const calculateProgress = () => {
        const nextTier = getNextTier();
        if (!nextTier) return 100; // Đã max cấp

        const currentTierIndex = TIERS.findIndex(t => t.name === profile.tier);
        const prevTierMin = currentTierIndex >= 0 ? TIERS[currentTierIndex].min : 0;
        
        const totalRange = nextTier.min - prevTierMin;
        const currentProgress = profile.points - prevTierMin;
        
        // Trả về %
        const percent = (currentProgress / totalRange) * 100;
        return Math.min(100, Math.max(0, percent));
    };

    const nextTierObj = getNextTier();

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* --- HEADER --- */}
            <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20">
                <button onClick={() => navigate('/')} className="mr-4 text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
            </div>

            <div className="p-4 space-y-6 max-w-md mx-auto">
                
                {/* 1. THẺ AVATAR & ĐIỂM SỐ */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold shadow-inner">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200">
                                <Camera size={16} className="text-gray-500" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                            Thành viên {profile.tier}
                        </span>
                    </div>

                    <div className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg shadow-blue-200">
                        <div>
                            <p className="text-blue-100 text-xs font-medium uppercase">Điểm khả dụng</p>
                            <p className="text-3xl font-extrabold">{profile.points.toLocaleString()}</p>
                        </div>
                        <Award size={32} className="text-white/80" />
                    </div>
                </div>

                {/* 2. TIẾN TRÌNH THĂNG HẠNG */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-700 text-sm">Tiến trình hạng</h3>
                        {nextTierObj ? (
                            <span className="text-xs text-gray-500">Mục tiêu: <b className="text-gray-800">{nextTierObj.name}</b></span>
                        ) : (
                            <span className="text-xs text-green-600 font-bold">Đẳng cấp tối thượng!</span>
                        )}
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                        <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${calculateProgress()}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase">
                        <span>{profile.points.toLocaleString()} pts</span>
                        <span>{nextTierObj ? nextTierObj.min.toLocaleString() : 'MAX'} pts</span>
                    </div>
                </div>

                {/* 3. FORM THÔNG TIN CÁ NHÂN */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <User size={18} className="text-blue-500"/> Thông tin tài khoản
                        </h3>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition"
                            >
                                Sửa
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-md"><X size={18}/></button>
                                <button onClick={handleUpdate} className="text-green-600 p-1.5 hover:bg-green-50 rounded-md"><Save size={18}/></button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Họ tên */}
                        <div className="group">
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Họ và tên</label>
                            <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                <User className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="text" 
                                    value={isEditing ? editForm.name : profile.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                />
                            </div>
                        </div>

                        {/* Số điện thoại (Read-only) */}
                        <div>
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Số điện thoại</label>
                            <div className="flex items-center p-3 rounded-xl border border-gray-100 bg-gray-100/50">
                                <Phone className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="text" 
                                    value={profile.phone}
                                    disabled={true}
                                    className="w-full bg-transparent outline-none text-gray-500 font-medium cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Email</label>
                            <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                <Mail className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="email" 
                                    value={isEditing ? (editForm.email || '') : (profile.email || '')}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    disabled={!isEditing}
                                    placeholder="Chưa cập nhật email"
                                    className="w-full bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <button 
                            onClick={handleUpdate}
                            className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition transform"
                        >
                            Lưu Thay Đổi
                        </button>
                    )}
                </div>

                {/* 4. NÚT ĐĂNG XUẤT */}
                <button 
                    onClick={handleLogout}
                    className="w-full bg-white text-red-500 font-semibold py-3 rounded-xl shadow-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-50 transition active:scale-95"
                >
                    <LogOut size={18} /> Đăng xuất
                </button>

            </div>
        </div>
    );
};

export default ProfilePage;