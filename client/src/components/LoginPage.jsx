/**
 * ================================================================
 * LOGIN PAGE - Trang đăng nhập
 * ================================================================
 */

import { useState } from 'react';

const APP_PASSWORD = 'thau2024';  // Mật khẩu - sync với App.jsx

function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check password
    if (password === APP_PASSWORD) {
      // Lưu session
      localStorage.setItem('thau_auth', btoa(password + '_' + Date.now()));
      localStorage.setItem('thau_auth_time', Date.now().toString());
      onLogin(true);
    } else {
      setError('Sai mật khẩu!');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎰</div>
          <h1 className="text-2xl font-bold text-gray-800">THẦU CALCULATOR</h1>
          <p className="text-gray-500 text-sm mt-2">Nhập mật khẩu để tiếp tục</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔐 Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="Nhập mật khẩu..."
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang kiểm tra...' : '🔓 ĐĂNG NHẬP'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-xs">
          <p>© 2024 Thầu Calculator</p>
          <p className="mt-1">Liên hệ admin nếu quên mật khẩu</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
