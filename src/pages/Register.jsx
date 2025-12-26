import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// --- QUAN TRỌNG: Import file CSS vừa tạo ---
import '../Register.css'; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', phone: '', password: '', address: '', gender: 'Nam', dob: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/customers', formData);
            alert('Đăng ký thành công! Hãy đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Đăng Ký Tài Khoản</h2>
            
            {error && <div className="alert-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                {/* Họ và tên */}
                <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input 
                        type="text" className="form-input" required
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* Số điện thoại */}
                <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input 
                        type="text" className="form-input" required
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </div>

                {/* Mật khẩu */}
                <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input 
                        type="password" className="form-input" required
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
                
                {/* Địa chỉ */}
                <div className="form-group">
                    <label className="form-label">Địa chỉ</label>
                    <input 
                        type="text" className="form-input"
                        placeholder="Nhập địa chỉ nhà"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                </div>

                {/* Hàng ngang: Giới tính & Ngày sinh (Cho đẹp) */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Giới tính</label>
                        <select 
                            className="form-input"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Ngày sinh</label>
                        <input 
                            type="date" className="form-input"
                            value={formData.dob}
                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-submit">Đăng Ký Ngay</button>
            </form>
        </div>
    );
};

export default Register;