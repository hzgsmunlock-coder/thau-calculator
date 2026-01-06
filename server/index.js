/**
 * ================================================================
 * EXPRESS SERVER - Backend chính
 * ================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './db/database.js';
import billRoutes from './routes/bill.js';
import ketquaRoutes from './routes/ketqua.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/ketqua', ketquaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Có lỗi xảy ra!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║         THẦU CALCULATOR SERVER                   ║
╠══════════════════════════════════════════════════╣
║  🚀 Server đang chạy tại: http://localhost:${PORT}  ║
║  📊 API: http://localhost:${PORT}/api               ║
║  🔧 Environment: ${process.env.NODE_ENV || 'development'}              ║
╚══════════════════════════════════════════════════╝
  `);
  
  // Start Telegram Bot in production
  if (process.env.NODE_ENV === 'production' && process.env.TELEGRAM_BOT_TOKEN) {
    console.log('🤖 Starting Telegram Bot...');
    import('../bot/index.js')
      .then(() => console.log('✅ Telegram Bot started!'))
      .catch(err => console.error('❌ Bot error:', err.message));
  }
});

export default app;

