import axios from 'axios';

const axiosClient = axios.create({
  // ⚠️ QUAN TRỌNG: Dùng biến môi trường. 
  // Nếu trên Vercel nó sẽ lấy link Render, nếu ở máy bạn nó sẽ lấy localhost.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', 
  
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
    // CHỈ CÓ LOGIN VÀ REGISTER LÀ KHÔNG CẦN TOKEN
    const publicUrls = ['/login', '/register']; 
    
    // Kiểm tra nếu request là public
    // Lưu ý: config.url có thể chỉ là '/login' hoặc '/api/login' tùy cách gọi
    const isPublic = publicUrls.some(url => config.url && config.url.includes(url));

    const token = localStorage.getItem('token');
    
    // Nếu có token VÀ KHÔNG PHẢI URL public thì gắn Token vào
    if (token && !isPublic) {
        config.headers.Authorization = `Bearer ${token}`;
    } 
    // Nếu là public URL (Login/Register) thì xóa Header Authorization để tránh lỗi
    else if (isPublic) {
        delete config.headers.Authorization;
    }
    
    return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    // Trả về data gọn gàng
    if (response && response.data) {
        return response.data;
    }
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;