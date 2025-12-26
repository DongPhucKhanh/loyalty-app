import axios from 'axios';

const axiosClient = axios.create({
    // SỬA Ở ĐÂY: Tự động lấy link từ Vercel (nếu có) hoặc dùng localhost (nếu chạy máy nhà)
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
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
    // Nếu có data thì trả về data, tránh lỗi undefined
    if (response && response.data) {
        return response.data; 
    }
    return response;
}, (error) => {
    // Nếu lỗi 401 (Chưa đăng nhập/Token sai) -> Xóa token và bắt đăng nhập lại
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        
        // Mẹo: Trên môi trường thật (Deploy) nên bật dòng này để nó tự đá về trang login
        // window.location.href = '/login'; 
    }
    return Promise.reject(error);
});

export default axiosClient;