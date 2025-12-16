import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Backend trả về JWT Response hoặc User object
      const res = await axiosClient.post('/register', form); 
      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate('/login');
    } catch (error) {
      alert("Lỗi đăng ký: " + (error.response?.data || "Có lỗi xảy ra"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-white">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Tạo Tài Khoản</h1>
      <p className="text-gray-500 mb-8">Tích điểm đổi quà ngay hôm nay</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <input type="text" placeholder="Họ và tên" required
          className="w-full p-4 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none"
          onChange={e => setForm({...form, name: e.target.value})} />
        <input type="text" placeholder="Số điện thoại" required
          className="w-full p-4 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none"
          onChange={e => setForm({...form, phone: e.target.value})} />
        <input type="password" placeholder="Mật khẩu" required
          className="w-full p-4 bg-gray-50 rounded-xl border focus:border-blue-500 outline-none"
          onChange={e => setForm({...form, password: e.target.value})} />
        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg">Đăng Ký</button>
      </form>
      <p className="text-center mt-6 text-gray-500" onClick={() => navigate('/login')}>
        Đã có tài khoản? <span className="text-blue-600 font-bold">Đăng nhập</span>
      </p>
    </div>
  );
}
export default Register;