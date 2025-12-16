import { Home, Gift, Clock } from 'lucide-react'; // Nhớ import icon Clock
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Hàm style chung cho nút
  const navItemClass = (path) => 
    `flex flex-col items-center justify-center w-full py-2 transition-colors ${
      isActive(path) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="fixed bottom-0 w-full bg-white border-t flex justify-around items-center pb-safe z-50">
      <button onClick={() => navigate('/')} className={navItemClass('/')}>
        <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Trang chủ</span>
      </button>

      <button onClick={() => navigate('/rewards')} className={navItemClass('/rewards')}>
        <Gift size={24} strokeWidth={isActive('/rewards') ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Đổi quà</span>
      </button>

      {/* Nút Lịch Sử Mới */}
      <button onClick={() => navigate('/history')} className={navItemClass('/history')}>
        <Clock size={24} strokeWidth={isActive('/history') ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Lịch sử</span>
      </button>
    </div>
  );
}
export default BottomNav;