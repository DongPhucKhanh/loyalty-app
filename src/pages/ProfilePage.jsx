import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
    User, Mail, Phone, Edit3, Save, X, 
    Award, ChevronLeft, LogOut, Camera,
    MapPin, Calendar, UserCheck 
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State lưu danh sách hạng lấy từ DB (Thay cho hardcode)
    const [tiersList, setTiersList] = useState([]); 

    const [profile, setProfile] = useState({
        id: '', name: '', phone: '', email: '',
        address: '', gender: '', dob: '', avatar: '',
        points: 0, tier: 'Mới'
    });

    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem('id') || JSON.parse(localStorage.getItem('user_info'))?.id;
            
            if (!userId) {
                alert("Phiên đăng nhập hết hạn!");
                navigate('/login');
                return;
            }

            // --- GỌI 2 API CÙNG LÚC (Profile & Tiers) ---
            const [userRes, tiersRes] = await Promise.all([
                axiosClient.get(`/customers/${userId}`), // Lấy thông tin user
                axiosClient.get('/tiers')                // Lấy danh sách hạng từ DB
            ]);
            
            // 1. Xử lý danh sách hạng (Sắp xếp tăng dần theo điểm cho chắc chắn)
            // Giả sử API trả về mảng object có trường: { name: 'Vàng', minPoint: 5000 }
            const sortedTiers = tiersRes.sort((a, b) => a.minPoint - b.minPoint);
            setTiersList(sortedTiers);

            // 2. Xử lý thông tin user
            const userData = {
                id: userRes.id,
                name: userRes.name,
                phone: userRes.phone,
                email: userRes.email || '',
                address: userRes.address || '',
                gender: userRes.gender || 'Nam',
                dob: userRes.dob || '',
                avatar: userRes.avatar || '',
                points: userRes.pointBalance || 0,
                tier: userRes.tier || 'Mới'
            };
            
            setProfile(userData);
            setEditForm(userData);

        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            // alert("Không thể tải dữ liệu. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await axiosClient.put(`/customers/${profile.id}`, {
                name: editForm.name,
                email: editForm.email,
                phone: profile.phone,
                address: editForm.address,
                gender: editForm.gender,
                dob: editForm.dob
            });
            
            const newProfile = { ...profile, ...editForm };
            setProfile(newProfile);
            setIsEditing(false);
            alert("Cập nhật thành công!");
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data || error.message));
        }
    };

    const handleLogout = () => {
        if(window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
            localStorage.clear();
            navigate('/login');
        }
    };

    // --- LOGIC TÍNH TIẾN TRÌNH (DÙNG DỮ LIỆU ĐỘNG) ---
    
    // Tìm hạng tiếp theo dựa trên điểm hiện tại
    const getNextTier = () => {
        if (tiersList.length === 0) return null;
        // Tìm hạng nào có minPoint > điểm hiện tại
        return tiersList.find(t => t.minPoint > profile.points);
    };

    const calculateProgress = () => {
        if (tiersList.length === 0) return 0;

        const nextTier = getNextTier();
        if (!nextTier) return 100; // Đã max cấp

        // Tìm hạng hiện tại (Hạng có minPoint <= điểm hiện tại và lớn nhất trong số đó)
        // Hoặc đơn giản lấy hạng trước hạng tiếp theo
        const nextIndex = tiersList.indexOf(nextTier);
        const prevTier = nextIndex > 0 ? tiersList[nextIndex - 1] : { minPoint: 0 };
        
        const totalRange = nextTier.minPoint - prevTier.minPoint;
        const currentProgress = profile.points - prevTier.minPoint;
        
        const percent = (currentProgress / totalRange) * 100;
        return Math.min(100, Math.max(0, percent));
    };

    const nextTierObj = getNextTier();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải thông tin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
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
                            <div className="h-24 w-24 rounded-full overflow-hidden shadow-md border-4 border-white">
                                <img 
                                    src={profile.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
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
                            <p className="text-blue-100 text-xs font-medium uppercase">Điểm tích lũy</p>
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
                            <span className="text-xs text-green-600 font-bold">Cần tích điểm để lên hạng!</span>
                        )}
                    </div>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                        <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase">
                        <span>{profile.points.toLocaleString()} pts</span>
                        <span>{nextTierObj ? nextTierObj.minPoint.toLocaleString() : 'MAX'} pts</span>
                    </div>
                </div>

                {/* 3. FORM THÔNG TIN (Giữ nguyên như cũ) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <User size={18} className="text-blue-500"/> Thông tin tài khoản
                        </h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition">Sửa</button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-md"><X size={18}/></button>
                                <button onClick={handleUpdate} className="text-green-600 p-1.5 hover:bg-green-50 rounded-md"><Save size={18}/></button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Họ và tên</label>
                            <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                <User className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="text" value={isEditing ? editForm.name : profile.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    disabled={!isEditing}
                                    className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Số điện thoại</label>
                            <div className="flex items-center p-3 rounded-xl border border-gray-100 bg-gray-100/50">
                                <Phone className="text-gray-400 mr-3" size={18} />
                                <input type="text" value={profile.phone} disabled className="w-full bg-transparent outline-none text-gray-500 font-medium cursor-not-allowed"/>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Email</label>
                            <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                <Mail className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="email" value={isEditing ? (editForm.email || '') : (profile.email || '')}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                    disabled={!isEditing} placeholder="Chưa cập nhật"
                                    className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Địa chỉ</label>
                            <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                <MapPin className="text-gray-400 mr-3" size={18} />
                                <input 
                                    type="text" value={isEditing ? (editForm.address || '') : (profile.address || '')}
                                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                    disabled={!isEditing} placeholder="Chưa cập nhật địa chỉ"
                                    className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Giới tính</label>
                                <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                    <UserCheck className="text-gray-400 mr-2" size={18} />
                                    {isEditing ? (
                                        <select 
                                            value={editForm.gender || 'Nam'} 
                                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                            className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    ) : (
                                        <span className="text-gray-700 font-medium">{profile.gender}</span>
                                    )}
                                </div>
                            </div>

                            <div className="w-1/2">
                                <label className="text-xs text-gray-400 font-medium ml-1 mb-1 block">Ngày sinh</label>
                                <div className={`flex items-center p-3 rounded-xl border transition-colors ${isEditing ? 'border-blue-500 bg-white ring-2 ring-blue-100' : 'border-gray-100 bg-gray-50'}`}>
                                    <Calendar className="text-gray-400 mr-2" size={18} />
                                    <input 
                                        type="date" 
                                        value={isEditing ? (editForm.dob || '') : (profile.dob || '')}
                                        onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                                        disabled={!isEditing}
                                        className="w-full bg-transparent outline-none text-gray-700 font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <button onClick={handleUpdate} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition transform">
                            Lưu Thay Đổi
                        </button>
                    )}
                </div>

                <button onClick={handleLogout} className="w-full bg-white text-red-500 font-semibold py-3 rounded-xl shadow-sm border border-red-100 flex items-center justify-center gap-2 hover:bg-red-50 transition active:scale-95">
                    <LogOut size={18} /> Đăng xuất
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;