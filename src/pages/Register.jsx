import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// --- QUAN TRỌNG: Import file CSS để đồng bộ giao diện ---
import '../Register.css'; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', phone: '', password: '', address: '', gender: 'Nam', dob: ''
    });
    const [error, setError] = useState('');
    // 1. Thêm state quản lý trạng thái đang gửi dữ liệu
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const { name, phone, password } = formData;

        // Kiểm tra họ tên: không số/ký tự đặc biệt
        const nameRegex = /^[a-zA-Z\s\u00C0-\u1EF9]+$/;
        if (!nameRegex.test(name)) {
            setError('Họ tên không hợp lệ (không chứa số hoặc ký tự đặc biệt)!');
            return false;
        }

        // Kiểm tra SĐT: chỉ số và < 10 chữ số
       const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone) || phone.length !== 10) {
        setError('Số điện thoại không hợp lệ (phải nhập đúng 10 chữ số)!');
        return false;
    }

        // Kiểm tra mật khẩu: >= 6 ký tự
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        // 2. Bắt đầu quá trình gửi dữ liệu
        setLoading(true); 

        try {
            await axiosClient.post('/customers', formData);
            alert('Đăng ký thành công! Hãy đăng nhập.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            // Hiển thị lỗi từ Backend trả về
            setError(err.response?.data || 'Đăng ký thất bại, vui lòng thử lại');
        } finally {
            // 3. Kết thúc quá trình (dù thành công hay thất bại)
            setLoading(false); 
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Đăng Ký Tài Khoản</h2>
            
            {error && <div className="alert-error" style={{
                backgroundColor: '#fff1f0',
                border: '1px solid #ffa39e',
                color: '#cf1322',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center'
            }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input 
                        type="text" className="form-input" required
                        placeholder="Ví dụ: Lý Văn Hợp"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        disabled={loading} // Khóa input khi đang loading
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input 
                        type="text" className="form-input" required
                        placeholder="Ví dụ: 037613627"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <input 
                        type="password" className="form-input" required
                        placeholder="Ít nhất 6 ký tự"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        disabled={loading}
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Địa chỉ</label>
                    <input 
                        type="text" className="form-input"
                        placeholder="Nhập địa chỉ nhà"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        disabled={loading}
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Giới tính</label>
                        <select 
                            className="form-input"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* 4. Cập nhật nút bấm có trạng thái Loading */}
                <button 
                    type="submit" 
                    className={`btn-submit ${loading ? 'btn-disabled' : ''}`}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? '#bfbfbf' : '#1890ff',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    {loading ? (
                        <>
                            <span className="loader"></span> 
                            Đang xử lý...
                        </>
                    ) : 'Đăng Ký Ngay'}
                </button>
            </form>
        </div>
    );
};

export default Register;