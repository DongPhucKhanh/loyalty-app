import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Bật trạng thái loading để tránh bấm nhiều lần

    try {
      // 1. GỌI API ĐĂNG NHẬP
      // Lưu ý: Đường dẫn phải khớp với CustomerController ("/api/customers/login")
      // Vì axiosClient đã có baseURL='/api', nên ở đây gọi '/customers/login'
      const res = await axiosClient.post('/customers/login', form);
      
      // 2. LƯU TOKEN (Để các request sau này được xác thực)
      if (res.token) {
          localStorage.setItem('token', res.token);
      }

      // 3. LƯU THÔNG TIN USER (Để hiển thị ngay trên Header và Profile)
      // Backend trả về: { token, id, name, phone, email, points, tier }
      const userInfo = {
          id: res.id,
          name: res.name,
          phone: res.phone,
          email: res.email,
          points: res.points,
          tier: res.tier,
          role: 'CUSTOMER'
      };
      
      localStorage.setItem('user_info', JSON.stringify(userInfo)); 

      // 4. CHUYỂN HƯỚNG
      alert(`Xin chào ${res.name}!`);
      navigate('/');
      
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      // Hiển thị thông báo lỗi chi tiết từ Backend trả về
      const errorMsg = error.response?.data || "Sai số điện thoại hoặc mật khẩu!";
      alert(errorMsg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-white">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Đăng Nhập</h1>
      <p className="text-gray-500 mb-8">Chào mừng bạn quay trở lại hệ thống tích điểm.</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
            <input 
              type="text" 
              placeholder="Số điện thoại" 
              required
              className="w-full p-4 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none transition-colors"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})} 
            />
        </div>
        
        <div>
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              required
              className="w-full p-4 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none transition-colors"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} 
            />
        </div>

        <button 
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-500" onClick={() => navigate('/register')}>
            Chưa có tài khoản? <span className="text-blue-600 font-bold cursor-pointer hover:underline">Đăng ký ngay</span>
        </p>
      </div>
    </div>
  );
}

export default Login;