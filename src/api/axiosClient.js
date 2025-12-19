import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://loyalty-backend-nftv.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
    // CHỈ CÓ LOGIN VÀ REGISTER LÀ KHÔNG CẦN TOKEN
    const publicUrls = ['/login', '/register']; 
    
    // Kiểm tra nếu request là public
    const isPublic = publicUrls.some(url => config.url.includes(url));

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
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
