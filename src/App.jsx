import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rewards from './pages/Rewards';
import History from './pages/History'; // Import trang mới
import BottomNav from './components/BottomNav';
import ProfilePage from './pages/ProfilePage';

function Layout() {
  const location = useLocation();
  // Hiển thị menu ở 3 trang này
  const showNav = ['/', '/rewards', '/history'].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/rewards" element={<Rewards />} />
        
        {/* Route mới cho trang Lịch Sử */}
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      
      {showNav && <BottomNav />}
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