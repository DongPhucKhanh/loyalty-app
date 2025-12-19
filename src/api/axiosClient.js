import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Địa chỉ Backend Spring Boot
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. Gửi đi: Tự động đính kèm Token vào Header
axiosClient.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Nhận về: Xử lý lỗi (Ví dụ: Token hết hạn thì đá ra trang Login)
axiosClient.interceptors.response.use((response) => {
    return response.data; // Trả về dữ liệu gốc cho gọn
}, (error) => {
    // Nếu lỗi 401 (Chưa đăng nhập/Token sai) -> Xóa token và bắt đăng nhập lại
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        // window.location.href = '/'; // Bỏ comment dòng này nếu muốn tự động chuyển trang
    }
    return Promise.reject(error);
});

export default axiosClient;