/**
 * ================================================================
 * AUTH ROUTES - API xác thực và quản lý users
 * ================================================================
 */

import express from 'express';
import crypto from 'crypto';
import { usersDb, sessionsDb } from '../db/database.js';

const router = express.Router();

// Generate random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// ================================================================
// PUBLIC ROUTES
// ================================================================

/**
 * POST /api/auth/login - Đăng nhập
 */
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Thiếu username hoặc password' });
    }
    
    const result = usersDb.login(username, password);
    
    if (result.success) {
      // Tạo session token
      const token = generateToken();
      const deviceInfo = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      sessionsDb.create(result.user.id, token, deviceInfo, ipAddress);
      
      res.json({
        success: true,
        token,
        user: result.user
      });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * POST /api/auth/logout - Đăng xuất
 */
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      sessionsDb.delete(token);
    }
    
    res.json({ success: true, message: 'Đã đăng xuất' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * GET /api/auth/verify - Kiểm tra token
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Không có token' });
    }
    
    const session = sessionsDb.verify(token);
    
    if (session) {
      res.json({
        success: true,
        user: {
          id: session.user_id,
          username: session.username,
          display_name: session.display_name,
          role: session.role
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ================================================================
// ADMIN MIDDLEWARE
// ================================================================

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Không có token' });
  }
  
  const session = sessionsDb.verify(token);
  
  if (!session) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
  
  if (session.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền admin' });
  }
  
  req.user = session;
  next();
};

// ================================================================
// ADMIN ROUTES
// ================================================================

/**
 * GET /api/auth/users - Lấy danh sách users (Admin only)
 */
router.get('/users', requireAdmin, (req, res) => {
  try {
    const users = usersDb.getAll();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * POST /api/auth/users - Tạo user mới (Admin only)
 */
router.post('/users', requireAdmin, (req, res) => {
  try {
    const { username, password, display_name, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Thiếu username hoặc password' });
    }
    
    // Không cho tạo admin từ API
    const userRole = role === 'admin' ? 'user' : (role || 'user');
    
    const result = usersDb.create({
      username,
      password,
      display_name: display_name || username,
      role: userRole
    });
    
    if (result.success) {
      res.json({ success: true, id: result.id, message: 'Tạo user thành công' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * PUT /api/auth/users/:id - Update user (Admin only)
 */
router.put('/users/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { password, display_name, is_active, role } = req.body;
    
    const result = usersDb.update(parseInt(id), {
      password,
      display_name,
      is_active,
      role: role === 'admin' ? undefined : role // Không cho đổi thành admin
    });
    
    if (result.success) {
      // Nếu disable user, xóa sessions của họ
      if (is_active === false || is_active === 0) {
        sessionsDb.deleteByUserId(parseInt(id));
      }
      res.json({ success: true, message: 'Update thành công' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * DELETE /api/auth/users/:id - Xóa user (Admin only)
 */
router.delete('/users/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Xóa sessions trước
    sessionsDb.deleteByUserId(parseInt(id));
    
    const result = usersDb.delete(parseInt(id));
    
    if (result.success) {
      res.json({ success: true, message: 'Xóa user thành công' });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * GET /api/auth/sessions - Lấy danh sách sessions active (Admin only)
 */
router.get('/sessions', requireAdmin, (req, res) => {
  try {
    const sessions = sessionsDb.getActiveSessions();
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

/**
 * DELETE /api/auth/sessions/:userId - Kick user offline (Admin only)
 */
router.delete('/sessions/:userId', requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    sessionsDb.deleteByUserId(parseInt(userId));
    res.json({ success: true, message: 'Đã kick user offline' });
  } catch (error) {
    console.error('Kick user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
