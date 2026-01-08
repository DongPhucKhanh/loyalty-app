import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rewards from './pages/Rewards';
import History from './pages/History';
import ProfilePage from './pages/ProfilePage';
import MemberLevelPage from './pages/MemberLevelPage';

// --- CHỈ GIỮ LẠI CHATBOT AI ---
import ChatAIWidget from './components/ChatAIWidget'; 
import BottomNav from './components/BottomNav';

function Layout() {
  const location = useLocation();

  // 1. Cấu hình các trang hiện Menu điều hướng dưới cùng (BottomNav)
  const navPaths = ['/', '/rewards', '/history', '/profile'];
  const showNav = navPaths.includes(location.pathname);

  // 2. Cấu hình hiển thị Chatbot AI (Ẩn ở trang đăng nhập/đăng ký)
  const hideChatPaths = ['/login', '/register'];
  const showChat = !hideChatPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/member-level" element={<MemberLevelPage />} />
      </Routes>
      
      {/* Menu điều hướng chính */}
      {showNav && <BottomNav />}

      {/* Trợ lý ảo thông minh luôn sẵn sàng hỗ trợ khách hàng */}
      {showChat && <ChatAIWidget />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;