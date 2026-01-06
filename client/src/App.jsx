import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import BillCalculator from './components/BillCalculator'
import KetQuaPage from './components/KetQuaPage'
import ThongKePage from './components/ThongKePage'
import CongThucPage from './components/CongThucPage'
import TinhTienKhachPage from './components/TinhTienKhachPage'
import LoginPage from './components/LoginPage'
import { getTodayString, getDayOfWeek, LICH_XO_SO } from './utils/constants'

// Auth check - session valid for 24 hours
const APP_PASSWORD = 'thau2024';  // Mật khẩu mặc định - thay đổi trong .env
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function checkAuth() {
  const auth = localStorage.getItem('thau_auth');
  const authTime = localStorage.getItem('thau_auth_time');
  
  if (!auth || !authTime) return false;
  
  // Check session expiry
  const elapsed = Date.now() - parseInt(authTime);
  if (elapsed > SESSION_DURATION) {
    localStorage.removeItem('thau_auth');
    localStorage.removeItem('thau_auth_time');
    return false;
  }
  
  // Verify password
  try {
    const decoded = atob(auth);
    const password = decoded.split('_')[0];
    return password === APP_PASSWORD;
  } catch {
    return false;
  }
}

// Mobile Bottom Navigation
function MobileBottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: 'Bill', icon: '📝' },
    { path: '/tinh-tien-khach', label: 'Tính tiền', icon: '💵' },
    { path: '/ketqua', label: 'Kết quả', icon: '🎰' },
    { path: '/thongke', label: 'Thống kê', icon: '📊' },
    { path: '/cong-thuc', label: 'Công thức', icon: '📖' }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
              currentPath === item.path
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

// Desktop Top Navigation
function DesktopNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: 'Nhập Bill', icon: '📝' },
    { path: '/tinh-tien-khach', label: 'Tính Tiền Khách', icon: '💵' },
    { path: '/ketqua', label: 'Kết Quả', icon: '🎰' },
    { path: '/thongke', label: 'Thống Kê', icon: '📊' },
    { path: '/cong-thuc', label: 'Công Thức', icon: '📖' }
  ]

  return (
    <nav className="hidden md:block bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-5 py-4 font-medium transition-all border-b-2 ${
                currentPath === item.path
                  ? 'text-blue-600 border-blue-600 bg-blue-50'
                  : 'text-gray-600 border-transparent hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

// Compact Header for Mobile
function Header({ onLogout }) {
  const today = getTodayString()
  const dayOfWeek = getDayOfWeek(today)
  const dayLabels = {
    'C_NHAT': 'CN',
    'THU_2': 'T2',
    'THU_3': 'T3',
    'THU_4': 'T4',
    'THU_5': 'T5',
    'THU_6': 'T6',
    'THU_7': 'T7'
  }
  const dayLabelsFull = {
    'C_NHAT': 'Chủ Nhật',
    'THU_2': 'Thứ 2',
    'THU_3': 'Thứ 3',
    'THU_4': 'Thứ 4',
    'THU_5': 'Thứ 5',
    'THU_6': 'Thứ 6',
    'THU_7': 'Thứ 7'
  }
  const lichHomNay = LICH_XO_SO[dayOfWeek]

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white safe-area-top">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo - Mobile compact */}
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">🎲</span>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold leading-tight">
                THẦU<span className="hidden sm:inline"> CALCULATOR</span>
              </h1>
              <p className="text-white/70 text-[10px] sm:text-xs hidden sm:block">
                Hệ thống tính toán lô đề
              </p>
            </div>
          </div>
          
          {/* Date info + Logout */}
          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-right">
              <div className="text-xs sm:text-sm font-medium">
                <span className="sm:hidden">{dayLabels[dayOfWeek]}</span>
                <span className="hidden sm:inline">📅 {dayLabelsFull[dayOfWeek]}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-white/80">
                {new Date(today).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
            
            {/* Logout button */}
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              title="Đăng xuất"
            >
              🚪
            </button>
          </div>
        </div>

        {/* Lịch xổ số - Show on larger screens */}
        {lichHomNay && (
          <div className="hidden sm:flex flex-wrap gap-2 mt-3 text-xs">
            <span className="bg-white/20 px-2 py-1 rounded">
              MN: {lichHomNay.MN?.slice(0, 3).join(', ')}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded">
              MT: {lichHomNay.MT?.slice(0, 2).join(', ')}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    setIsAuthenticated(checkAuth());
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('thau_auth');
    localStorage.removeItem('thau_auth_time');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">⏳ Đang tải...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={setIsAuthenticated} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <Header onLogout={handleLogout} />
        <DesktopNav />

        {/* Main content with bottom padding for mobile nav */}
        <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 md:pb-6">
          <Routes>
            <Route path="/" element={<BillCalculator />} />
            <Route path="/tinh-tien-khach" element={<TinhTienKhachPage />} />
            <Route path="/ketqua" element={<KetQuaPage />} />
            <Route path="/thongke" element={<ThongKePage />} />
            <Route path="/cong-thuc" element={<CongThucPage />} />
          </Routes>
        </main>

        {/* Footer - Hidden on mobile */}
        <footer className="hidden md:block bg-gray-800 text-gray-400 py-4">
          <div className="container mx-auto px-4 text-center text-sm">
            <p>© 2024 Thầu Calculator - Công cụ tính toán lô đề</p>
            <p className="text-gray-500 mt-1">⚠️ Chỉ dùng cho mục đích tham khảo</p>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </Router>
  )
}

export default App
