/**
 * ================================================================
 * ADMIN PANEL - Quản lý người dùng
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function AdminPanel({ sessionToken, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form tạo user mới
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  
  // Form edit user
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    password: '',
    role: 'user',
    is_active: true
  });

  // Load danh sách users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || 'Không thể tải danh sách người dùng');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Tạo user mới
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newUser.username || !newUser.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Đã tạo người dùng "${newUser.username}" thành công!`);
        setNewUser({ username: '', password: '', role: 'user' });
        setShowCreateForm(false);
        loadUsers();
      } else {
        setError(data.error || 'Không thể tạo người dùng');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  // Cập nhật user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updateData = {
        role: editForm.role,
        is_active: editForm.is_active
      };
      
      // Chỉ gửi password nếu có nhập
      if (editForm.password) {
        updateData.password = editForm.password;
      }
      
      const res = await fetch(`${API_URL}/api/auth/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Đã cập nhật người dùng "${editingUser.username}" thành công!`);
        setEditingUser(null);
        loadUsers();
      } else {
        setError(data.error || 'Không thể cập nhật người dùng');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  // Xóa user
  const handleDeleteUser = async (user) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"?`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Đã xóa người dùng "${user.username}"!`);
        loadUsers();
      } else {
        setError(data.error || 'Không thể xóa người dùng');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  // Toggle active status
  const handleToggleActive = async (user) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Đã ${user.is_active ? 'khóa' : 'mở khóa'} người dùng "${user.username}"!`);
        loadUsers();
      } else {
        setError(data.error || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      password: '',
      role: user.role,
      is_active: user.is_active
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa đăng nhập';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">👑</span>
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-1">Quản lý người dùng hệ thống</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Create User Button */}
        {!showCreateForm && !editingUser && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all"
          >
            ➕ Tạo người dùng mới
          </button>
        )}

        {/* Create User Form */}
        {showCreateForm && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">➕ Tạo người dùng mới</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Tên đăng nhập</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập tên đăng nhập..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Mật khẩu</label>
                <input
                  type="text"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Vai trò</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✓ Tạo
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✕ Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit User Form */}
        {editingUser && (
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Sửa người dùng: {editingUser.username}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Mật khẩu mới (để trống nếu không đổi)</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới..."
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Vai trò</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="user">Người dùng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-gray-300">Kích hoạt tài khoản</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✓ Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                >
                  ✕ Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            👥 Danh sách người dùng ({users.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              Đang tải...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Chưa có người dùng nào
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-xl border ${
                    user.is_active
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-red-900/20 border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">
                          {user.username}
                        </span>
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-yellow-600 text-yellow-100 text-xs rounded-full">
                            👑 Admin
                          </span>
                        )}
                        {!user.is_active && (
                          <span className="px-2 py-0.5 bg-red-600 text-red-100 text-xs rounded-full">
                            🔒 Đã khóa
                          </span>
                        )}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        Đăng nhập: {user.login_count || 0} lần • Lần cuối: {formatDate(user.last_login)}
                      </div>
                      {user.telegram_user_id && (
                        <div className="text-blue-400 text-sm">
                          📱 Telegram: {user.telegram_user_id}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'bg-red-600/30 hover:bg-red-600/50 text-red-400'
                            : 'bg-green-600/30 hover:bg-green-600/50 text-green-400'
                        }`}
                        title={user.is_active ? 'Khóa' : 'Mở khóa'}
                      >
                        {user.is_active ? '🔒' : '🔓'}
                      </button>
                      <button
                        onClick={() => startEdit(user)}
                        className="p-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to App button */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all"
        >
          ← Quay lại ứng dụng
        </button>
      </div>
    </div>
  );
}
