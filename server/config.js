/**
 * ================================================================
 * APP CONFIG - Cấu hình Server & Bot
 * ================================================================
 * 
 * 🔐 ĐỔI MẬT KHẨU TẠI ĐÂY:
 * Chỉ cần sửa giá trị BOT_PASSWORD bên dưới
 * Hoặc set biến môi trường BOT_PASSWORD trên Railway
 * 
 */

import dotenv from 'dotenv';
dotenv.config();

// ============================================================
// 🔐 MẬT KHẨU BOT - SỬA TẠI ĐÂY
// ============================================================
export const BOT_PASSWORD = process.env.BOT_PASSWORD || 'thau2024';

// ============================================================
// 🔑 API KEYS (từ .env)
// ============================================================
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ============================================================
// 🎨 APP INFO
// ============================================================
export const APP_NAME = 'Thầu Calculator';
export const APP_VERSION = '1.0.0';
