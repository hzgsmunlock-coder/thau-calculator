/**
 * ================================================================
 * LOGIN PAGE - Trang đăng nhập (Multi-user)
 * ================================================================
 */

import { useState } from 'react';
import { API_URL } from '../config';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Lưu session vào localStorage
        localStorage.setItem('thau_session', data.sessionToken);
        localStorage.setItem('thau_user', JSON.stringify(data.user));
        onLogin(data.user, data.sessionToken);
      } else {
        setError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối server. Vui lòng thử lại.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎰</div>
          <h1 className="text-2xl font-bold text-white">THẦU CALCULATOR</h1>
          <p className="text-gray-400 text-sm mt-2">Nhập tài khoản để tiếp tục</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              👤 Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-lg placeholder-gray-400"
              placeholder="Nhập tên đăng nhập..."
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🔐 Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-lg placeholder-gray-400"
              placeholder="Nhập mật khẩu..."
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang đăng nhập...' : '🔓 ĐĂNG NHẬP'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>© 2024 Thầu Calculator</p>
          <p className="mt-1">Liên hệ admin nếu chưa có tài khoản</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
