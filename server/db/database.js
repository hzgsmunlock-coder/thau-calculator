/**
 * ================================================================
 * DATABASE SCHEMA - SQLite với better-sqlite3
 * ================================================================
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn database
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/thau.db');

// Đảm bảo thư mục data tồn tại
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Khởi tạo database
const db = new Database(DB_PATH);

// Bật foreign keys
db.pragma('foreign_keys = ON');

/**
 * Khởi tạo các bảng trong database
 */
export function initDatabase() {
  // Bảng users - quản lý người dùng
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      role TEXT DEFAULT 'user',
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      login_count INTEGER DEFAULT 0,
      telegram_user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bảng sessions - theo dõi phiên đăng nhập
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      device_info TEXT,
      ip_address TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tạo admin mặc định nếu chưa có
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    db.prepare(`
      INSERT INTO users (username, password, display_name, role)
      VALUES ('admin', 'admin123', 'Administrator', 'admin')
    `).run();
    console.log('✅ Created default admin account: admin / admin123');
  }

  // Bảng bills - lưu các bill từ khách
  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_user_id TEXT,
      telegram_chat_id TEXT,
      ngay DATE NOT NULL DEFAULT (date('now')),
      tong_thu REAL DEFAULT 0,
      tong_tra REAL DEFAULT 0,
      loi_lo REAL DEFAULT 0,
      trang_thai TEXT DEFAULT 'pending',
      raw_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bảng bill_lines - chi tiết từng dòng bill
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      numbers TEXT NOT NULL,
      diem REAL NOT NULL,
      kieu_choi TEXT NOT NULL,
      loai_dai TEXT NOT NULL,
      tien_thu REAL DEFAULT 0,
      tien_tra REAL DEFAULT 0,
      raw_line TEXT,
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
    )
  `);

  // Bảng ket_qua_xo_so - lưu kết quả xổ số
  db.exec(`
    CREATE TABLE IF NOT EXISTS ket_qua_xo_so (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ngay DATE NOT NULL,
      dai TEXT NOT NULL,
      giai_db TEXT,
      giai_1 TEXT,
      giai_2 TEXT,
      giai_3 TEXT,
      giai_4 TEXT,
      giai_5 TEXT,
      giai_6 TEXT,
      giai_7 TEXT,
      lo_2_so TEXT,
      lo_3_so TEXT,
      dau TEXT,
      duoi TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ngay, dai)
    )
  `);

  // Bảng thong_ke - thống kê theo ngày
  db.exec(`
    CREATE TABLE IF NOT EXISTS thong_ke (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ngay DATE NOT NULL UNIQUE,
      so_bill INTEGER DEFAULT 0,
      tong_thu REAL DEFAULT 0,
      tong_tra REAL DEFAULT 0,
      loi_lo REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Index để tăng tốc truy vấn
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bills_ngay ON bills(ngay);
    CREATE INDEX IF NOT EXISTS idx_bills_telegram_user ON bills(telegram_user_id);
    CREATE INDEX IF NOT EXISTS idx_bill_lines_bill_id ON bill_lines(bill_id);
    CREATE INDEX IF NOT EXISTS idx_ket_qua_ngay ON ket_qua_xo_so(ngay);
  `);

  console.log('✅ Database initialized successfully');
}

// ================================================================
// CRUD Operations cho Bills
// ================================================================

export const billsDb = {
  /**
   * Tạo bill mới
   */
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO bills (telegram_user_id, telegram_chat_id, ngay, tong_thu, raw_text)
      VALUES (@telegram_user_id, @telegram_chat_id, @ngay, @tong_thu, @raw_text)
    `);
    const result = stmt.run(data);
    return result.lastInsertRowid;
  },

  /**
   * Lấy bill theo ID
   */
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM bills WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Lấy tất cả bills theo ngày
   */
  getByDate: (ngay) => {
    const stmt = db.prepare('SELECT * FROM bills WHERE ngay = ? ORDER BY created_at DESC');
    return stmt.all(ngay);
  },

  /**
   * Lấy bills theo telegram user
   */
  getByTelegramUser: (userId) => {
    const stmt = db.prepare('SELECT * FROM bills WHERE telegram_user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  },

  /**
   * Cập nhật kết quả bill
   */
  updateResult: (id, data) => {
    const stmt = db.prepare(`
      UPDATE bills 
      SET tong_tra = @tong_tra, loi_lo = @loi_lo, trang_thai = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);
    return stmt.run({ ...data, id });
  },

  /**
   * Xóa bill
   */
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM bills WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * Lấy thống kê theo ngày
   */
  getStatsByDate: (ngay) => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as so_bill,
        SUM(tong_thu) as tong_thu,
        SUM(tong_tra) as tong_tra,
        SUM(loi_lo) as loi_lo
      FROM bills 
      WHERE ngay = ?
    `);
    return stmt.get(ngay);
  }
};

// ================================================================
// CRUD Operations cho Bill Lines
// ================================================================

export const billLinesDb = {
  /**
   * Thêm nhiều dòng bill
   */
  createMany: (billId, lines) => {
    const stmt = db.prepare(`
      INSERT INTO bill_lines (bill_id, numbers, diem, kieu_choi, loai_dai, tien_thu, raw_line)
      VALUES (@bill_id, @numbers, @diem, @kieu_choi, @loai_dai, @tien_thu, @raw_line)
    `);
    
    const insertMany = db.transaction((lines) => {
      for (const line of lines) {
        stmt.run({
          bill_id: billId,
          numbers: JSON.stringify(line.numbers),
          diem: line.diem,
          kieu_choi: line.kieuChoi,
          loai_dai: line.loaiDai,
          tien_thu: line.tienThu || 0,
          raw_line: line.raw || ''
        });
      }
    });
    
    insertMany(lines);
  },

  /**
   * Lấy tất cả dòng của 1 bill
   */
  getByBillId: (billId) => {
    const stmt = db.prepare('SELECT * FROM bill_lines WHERE bill_id = ?');
    const lines = stmt.all(billId);
    return lines.map(line => ({
      ...line,
      numbers: JSON.parse(line.numbers)
    }));
  },

  /**
   * Cập nhật tiền trả cho dòng
   */
  updatePayout: (id, tienTra) => {
    const stmt = db.prepare('UPDATE bill_lines SET tien_tra = ? WHERE id = ?');
    return stmt.run(tienTra, id);
  }
};

// ================================================================
// CRUD Operations cho Kết quả xổ số
// ================================================================

export const ketQuaDb = {
  /**
   * Lưu kết quả xổ số
   */
  save: (data) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO ket_qua_xo_so 
      (ngay, dai, giai_db, giai_1, giai_2, giai_3, giai_4, giai_5, giai_6, giai_7, lo_2_so, lo_3_so, dau, duoi)
      VALUES (@ngay, @dai, @giai_db, @giai_1, @giai_2, @giai_3, @giai_4, @giai_5, @giai_6, @giai_7, @lo_2_so, @lo_3_so, @dau, @duoi)
    `);
    return stmt.run(data);
  },

  /**
   * Lấy kết quả theo ngày và đài
   */
  getByDateAndDai: (ngay, dai) => {
    const stmt = db.prepare('SELECT * FROM ket_qua_xo_so WHERE ngay = ? AND dai = ?');
    const result = stmt.get(ngay, dai);
    if (result) {
      result.lo_2_so = JSON.parse(result.lo_2_so || '[]');
      result.lo_3_so = JSON.parse(result.lo_3_so || '[]');
    }
    return result;
  },

  /**
   * Lấy tất cả kết quả theo ngày
   */
  getByDate: (ngay) => {
    const stmt = db.prepare('SELECT * FROM ket_qua_xo_so WHERE ngay = ?');
    const results = stmt.all(ngay);
    return results.map(r => ({
      ...r,
      lo_2_so: JSON.parse(r.lo_2_so || '[]'),
      lo_3_so: JSON.parse(r.lo_3_so || '[]')
    }));
  }
};

// ================================================================
// CRUD Operations cho Users
// ================================================================

export const usersDb = {
  /**
   * Tạo user mới
   */
  create: (data) => {
    const stmt = db.prepare(`
      INSERT INTO users (username, password, display_name, role)
      VALUES (@username, @password, @display_name, @role)
    `);
    try {
      const result = stmt.run({
        username: data.username,
        password: data.password,
        display_name: data.display_name || data.username,
        role: data.role || 'user'
      });
      return { success: true, id: result.lastInsertRowid };
    } catch (e) {
      if (e.message.includes('UNIQUE')) {
        return { success: false, error: 'Username đã tồn tại' };
      }
      throw e;
    }
  },

  /**
   * Đăng nhập
   */
  login: (username, password) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1');
    const user = stmt.get(username, password);
    
    if (user) {
      // Update last login
      db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?').run(user.id);
      return { success: true, user: { ...user, password: undefined } };
    }
    return { success: false, error: 'Sai username hoặc password' };
  },

  /**
   * Lấy user theo ID
   */
  getById: (id) => {
    const stmt = db.prepare('SELECT id, username, display_name, role, is_active, last_login, login_count, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  /**
   * Lấy user theo username
   */
  getByUsername: (username) => {
    const stmt = db.prepare('SELECT id, username, display_name, role, is_active, last_login, login_count, created_at FROM users WHERE username = ?');
    return stmt.get(username);
  },

  /**
   * Lấy tất cả users
   */
  getAll: () => {
    const stmt = db.prepare('SELECT id, username, display_name, role, is_active, last_login, login_count, created_at FROM users ORDER BY created_at DESC');
    return stmt.all();
  },

  /**
   * Update user
   */
  update: (id, data) => {
    const fields = [];
    const values = {};
    
    if (data.password) {
      fields.push('password = @password');
      values.password = data.password;
    }
    if (data.display_name) {
      fields.push('display_name = @display_name');
      values.display_name = data.display_name;
    }
    if (typeof data.is_active !== 'undefined') {
      fields.push('is_active = @is_active');
      values.is_active = data.is_active ? 1 : 0;
    }
    if (data.role) {
      fields.push('role = @role');
      values.role = data.role;
    }
    
    if (fields.length === 0) return { success: false, error: 'Không có gì để update' };
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.id = id;
    
    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`);
    stmt.run(values);
    return { success: true };
  },

  /**
   * Xóa user
   */
  delete: (id) => {
    // Không cho xóa admin
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
    if (user?.role === 'admin') {
      return { success: false, error: 'Không thể xóa tài khoản admin' };
    }
    
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
    return { success: true };
  },

  /**
   * Đếm số users
   */
  count: () => {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    return stmt.get().count;
  }
};

// ================================================================
// Sessions Management
// ================================================================

export const sessionsDb = {
  /**
   * Tạo session mới
   */
  create: (userId, token, deviceInfo = '', ipAddress = '', expiresIn = 24 * 60 * 60 * 1000) => {
    // Xóa sessions cũ của user này
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    
    const expiresAt = new Date(Date.now() + expiresIn).toISOString();
    const stmt = db.prepare(`
      INSERT INTO sessions (user_id, token, device_info, ip_address, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId, token, deviceInfo, ipAddress, expiresAt);
    return token;
  },

  /**
   * Verify session token
   */
  verify: (token) => {
    const stmt = db.prepare(`
      SELECT s.*, u.username, u.display_name, u.role 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1
    `);
    return stmt.get(token);
  },

  /**
   * Xóa session (logout)
   */
  delete: (token) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(token);
  },

  /**
   * Lấy tất cả sessions đang active
   */
  getActiveSessions: () => {
    const stmt = db.prepare(`
      SELECT s.*, u.username, u.display_name 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.expires_at > datetime('now')
      ORDER BY s.created_at DESC
    `);
    return stmt.all();
  },

  /**
   * Xóa session của user
   */
  deleteByUserId: (userId) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
    stmt.run(userId);
  }
};

// Export database instance
export default db;
