/**
 * ================================================================
 * TELEGRAM BOT - Bot nhận bill và trả kết quả
 * ================================================================
 * 
 * Các lệnh:
 * /start - Bắt đầu
 * /login - Đăng nhập
 * /bill - Gửi bill mới
 * /ketqua - Nhập kết quả xổ số
 * /thongke - Xem thống kê ngày hôm nay
 * /help - Hướng dẫn
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextWithTesseract } from '../server/lib/localOCR.js';
import {
  calculateBill,
  calculateRevenue,
  calculatePayout,
  calculateProfit,
  parseBillText,
  formatMoney
} from '../server/lib/calculator.js';
import { billsDb, billLinesDb, ketQuaDb, initDatabase } from '../server/db/database.js';

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_PASSWORD = process.env.BOT_PASSWORD || 'thau2024';  // Mật khẩu bot

if (!TOKEN) {
  console.error('❌ Thiếu TELEGRAM_BOT_TOKEN trong file .env');
  process.exit(1);
}

// Initialize Gemini AI
let geminiModel = null;
if (GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI đã kết nối!');
  } catch (e) {
    console.log('⚠️ Không thể kết nối Gemini AI:', e.message);
  }
} else {
  console.log('⚠️ Chưa có GEMINI_API_KEY - Bot sẽ không đọc được ảnh thông minh');
}

// Khởi tạo database
initDatabase();

// Khởi tạo bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Lưu trạng thái user và authenticated users
const userStates = new Map();
const authenticatedUsers = new Set();  // Lưu user đã đăng nhập

console.log('🤖 Telegram Bot đang chạy...');
console.log('🔐 Bot password:', BOT_PASSWORD);

// ================================================================
// AUTHENTICATION
// ================================================================

/**
 * Check if user is authenticated
 */
function isAuthenticated(userId) {
  return authenticatedUsers.has(userId.toString());
}

/**
 * Require authentication middleware
 */
function requireAuth(chatId, userId, callback) {
  if (!isAuthenticated(userId)) {
    bot.sendMessage(chatId, `
🔐 *YÊU CẦU ĐĂNG NHẬP*
━━━━━━━━━━━━━━━━━━━━━━
Bạn cần đăng nhập để sử dụng bot.

Gửi lệnh: /login <mật khẩu>
Ví dụ: \`/login abc123\`
    `, { parse_mode: 'Markdown' });
    return false;
  }
  return true;
}

/**
 * /login - Đăng nhập
 */
bot.onText(/\/login(?:\s+(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const password = match[1]?.trim();
  
  if (!password) {
    bot.sendMessage(chatId, `
🔐 *ĐĂNG NHẬP*
━━━━━━━━━━━━━━━━━━━━━━
Gửi lệnh: /login <mật khẩu>
Ví dụ: \`/login abc123\`
    `, { parse_mode: 'Markdown' });
    return;
  }
  
  if (password === BOT_PASSWORD) {
    authenticatedUsers.add(userId);
    bot.sendMessage(chatId, `
✅ *ĐĂNG NHẬP THÀNH CÔNG!*
━━━━━━━━━━━━━━━━━━━━━━
Chào mừng bạn! Bây giờ bạn có thể sử dụng bot.

📝 Gửi /bill để nhập bill mới
📖 Gửi /help để xem hướng dẫn
    `, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `
❌ *SAI MẬT KHẨU!*
━━━━━━━━━━━━━━━━━━━━━━
Vui lòng thử lại hoặc liên hệ admin.
    `, { parse_mode: 'Markdown' });
  }
});

/**
 * /logout - Đăng xuất
 */
bot.onText(/\/logout/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  authenticatedUsers.delete(userId);
  userStates.delete(userId);
  
  bot.sendMessage(chatId, `
👋 *ĐÃ ĐĂNG XUẤT*
━━━━━━━━━━━━━━━━━━━━━━
Hẹn gặp lại! Gửi /login để đăng nhập lại.
  `, { parse_mode: 'Markdown' });
});

// ================================================================
// COMMAND HANDLERS
// ================================================================

/**
 * /start - Chào mừng
 */
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const userName = msg.from.first_name || 'Thầu';
  
  const isLoggedIn = isAuthenticated(userId);
  
  bot.sendMessage(chatId, `
🎰 *THẦU CALCULATOR BOT*
━━━━━━━━━━━━━━━━━━━━━━
Xin chào *${userName}*!

${isLoggedIn ? '✅ Bạn đã đăng nhập' : '🔐 Bạn chưa đăng nhập'}

Bot hỗ trợ tính toán cho thầu lô đề:
• Nhận bill từ khách
• Tính tiền thu
• Tính tiền trả khi có kết quả
• Báo cáo lời/lỗ

📝 *Các lệnh:*
${isLoggedIn ? '' : '/login - 🔐 Đăng nhập\n'}${isLoggedIn ? '/logout - 🚪 Đăng xuất\n' : ''}/bill - Gửi bill mới
/ketqua - Nhập kết quả xổ số
/thongke - Xem thống kê hôm nay
/help - Hướng dẫn chi tiết

⚠️ _Chỉ dùng cho mục đích tham khảo_
  `, { parse_mode: 'Markdown' });
});

/**
 * /help - Hướng dẫn
 */
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  bot.sendMessage(chatId, `
📖 *HƯỚNG DẪN SỬ DỤNG*
━━━━━━━━━━━━━━━━━━━━━━

*1️⃣ GỬI BILL:*
Gõ /bill rồi:
• Gửi text bill, hoặc
• 📷 Gửi ảnh bill rồi nhập text từ ảnh

Format:
\`\`\`
23 45 67 bl2 10d 1dai
89 12 bd 5d hn
34 56 78 da vong 2d
\`\`\`

*Ký hiệu:*
• \`bl2\` = Bao lô 2 số
• \`bl3\` = Bao lô 3 số  
• \`bd\` = Bao đảo
• \`da\` = Đá
• \`dv\` = Đá vòng
• \`dau/duoi\` = Đầu/Đuôi
• \`10d\` = 10 điểm
• \`1dai/2dai/hn/chung\` = Loại đài

*2️⃣ NHẬP KẾT QUẢ:*
Gõ /ketqua rồi gửi kết quả xổ số

*3️⃣ XEM THỐNG KÊ:*
Gõ /thongke để xem báo cáo ngày hôm nay

━━━━━━━━━━━━━━━━━━━━━━
💡 *LOGIC THẦU:*
• Tiền THU = Điểm × Hệ số thu
• Tiền TRẢ = Điểm × Thưởng × Số lần trúng
• LỜI = Thu > Trả
• LỖ = Thu < Trả
  `, { parse_mode: 'Markdown' });
});

/**
 * /bill - Nhận bill mới
 */
bot.onText(/\/bill/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Check auth
  if (!requireAuth(chatId, userId)) return;
  
  userStates.set(userId, { state: 'waiting_bill' });
  
  bot.sendMessage(chatId, `
📝 *GỬI BILL MỚI*
━━━━━━━━━━━━━━━━━━━━━━
Bạn có thể:

*1️⃣ Gửi TEXT:*
\`\`\`
23 45 bl2 10d 1dai
89 12 34 bd 5d hn
\`\`\`

*2️⃣ Gửi ẢNH BILL:*
📷 Chụp ảnh bill và gửi vào đây
_(Bot sẽ hướng dẫn nhập từ ảnh)_

Hoặc gửi /cancel để hủy
  `, { parse_mode: 'Markdown' });
});

/**
 * /ketqua - Nhập kết quả xổ số
 */
bot.onText(/\/ketqua/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Check auth
  if (!requireAuth(chatId, userId)) return;
  
  userStates.set(userId, { state: 'waiting_ketqua' });
  
  bot.sendMessage(chatId, `
🎰 *NHẬP KẾT QUẢ XỔ SỐ*
━━━━━━━━━━━━━━━━━━━━━━
Hãy gửi kết quả xổ số (các số):

\`\`\`
12345
67890
11111 22222
33333 44444 55555
...\`\`\`

Hoặc gửi /cancel để hủy
  `, { parse_mode: 'Markdown' });
});

/**
 * /thongke - Thống kê hôm nay
 */
bot.onText(/\/thongke/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  // Check auth
  if (!requireAuth(chatId, userId)) return;
  
  const ngay = new Date().toISOString().split('T')[0];
  
  try {
    const stats = billsDb.getStatsByDate(ngay);
    const bills = billsDb.getByDate(ngay);
    
    const loiLoText = (stats?.loi_lo || 0) >= 0 
      ? `🟢 LỜI +${formatMoney(stats?.loi_lo || 0)}`
      : `🔴 LỖ ${formatMoney(stats?.loi_lo || 0)}`;
    
    let message = `
📊 *THỐNG KÊ NGÀY ${ngay}*
━━━━━━━━━━━━━━━━━━━━━━

📋 Số bill: *${stats?.so_bill || 0}*
💰 Tổng thu: *${formatMoney(stats?.tong_thu || 0)}*
💸 Tổng trả: *${formatMoney(stats?.tong_tra || 0)}*

━━━━━━━━━━━━━━━━━━━━━━
*KẾT QUẢ:* ${loiLoText}
━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    // Thêm chi tiết bills nếu có
    if (bills.length > 0) {
      message += '\n*CHI TIẾT BILLS:*\n';
      bills.slice(0, 10).forEach((bill, idx) => {
        const status = bill.trang_thai === 'completed' ? '✅' : '⏳';
        const loiLo = bill.loi_lo >= 0 ? `+${formatMoney(bill.loi_lo)}` : formatMoney(bill.loi_lo);
        message += `${status} #${bill.id}: Thu ${formatMoney(bill.tong_thu)} → ${loiLo}\n`;
      });
      
      if (bills.length > 10) {
        message += `\n_... và ${bills.length - 10} bill khác_`;
      }
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Thongke error:', error);
    bot.sendMessage(chatId, '❌ Có lỗi khi lấy thống kê');
  }
});

/**
 * /cancel - Hủy thao tác
 */
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  
  userStates.delete(userId);
  bot.sendMessage(chatId, '❌ Đã hủy thao tác');
});

// ================================================================
// MESSAGE HANDLERS
// ================================================================

/**
 * OCR - Đọc text từ ảnh
 */
async function performOCR(imageUrl) {
  try {
    console.log('🔍 Đang đọc ảnh với OCR...');
    
    const result = await Tesseract.recognize(
      imageUrl,
      'vie+eng', // Tiếng Việt + Tiếng Anh
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('✅ OCR hoàn tất');
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    return null;
  }
}

/**
 * Parse OCR text thành bill format
 * Xử lý các format bill phổ biến từ ảnh
 */
function parseOCRToBill(ocrText) {
  if (!ocrText) return null;
  
  // Làm sạch text
  let text = ocrText
    .replace(/[^\w\s\n.,đĐdD]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Tìm các dòng có số
  const lines = text.split('\n');
  const billLines = [];
  
  for (const line of lines) {
    // Tìm các số 2-4 chữ số
    const numbers = line.match(/\b\d{2,4}\b/g);
    if (numbers && numbers.length > 0) {
      // Tìm điểm (số + d/đ)
      const diemMatch = line.match(/(\d+)\s*[dđĐD]/i);
      const diem = diemMatch ? parseInt(diemMatch[1]) : 1;
      
      // Tìm kiểu chơi
      let kieuChoi = 'bl2'; // Mặc định
      if (/b[aả]o\s*[đd][aả]o|bd|bđ/i.test(line)) kieuChoi = 'bd';
      else if (/bl3|b[aả]o\s*l[oô]\s*3/i.test(line)) kieuChoi = 'bl3';
      else if (/bl4|b[aả]o\s*l[oô]\s*4/i.test(line)) kieuChoi = 'bl4';
      else if (/[đd][aá]\s*v[oò]ng|dv/i.test(line)) kieuChoi = 'dv';
      else if (/[đd][aá]|da\b/i.test(line)) kieuChoi = 'da';
      else if (/[đd][aầ]u/i.test(line)) kieuChoi = 'dau';
      else if (/[đd]u[oô]i/i.test(line)) kieuChoi = 'duoi';
      
      // Tìm loại đài
      let loaiDai = '1dai';
      if (/2\s*[đd][aà]i|hai\s*[đd][aà]i/i.test(line)) loaiDai = '2dai';
      else if (/hn|h[aà]\s*n[oộ]i/i.test(line)) loaiDai = 'hn';
      else if (/chung|bc/i.test(line)) loaiDai = 'chung';
      
      // Tạo dòng bill
      const billLine = `${numbers.join(' ')} ${kieuChoi} ${diem}d ${loaiDai}`;
      billLines.push(billLine);
    }
  }
  
  return billLines.length > 0 ? billLines.join('\n') : null;
}

/**
 * Xử lý ảnh được gửi vào - SỬ DỤNG GEMINI AI
 */
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const userState = userStates.get(userId);
  
  // Check auth
  if (!requireAuth(chatId, userId)) return;
  
  // Lấy ảnh có độ phân giải cao nhất
  const photos = msg.photo;
  const highestResPhoto = photos[photos.length - 1];
  const fileId = highestResPhoto.file_id;
  
  try {
    // Thông báo đang xử lý
    const processingMsg = await bot.sendMessage(chatId, `
🤖 *ĐANG XỬ LÝ ẢNH...*
━━━━━━━━━━━━━━━━━━━━━━
⏳ Đang đọc và phân tích bill...
_${geminiModel ? 'Gemini AI đang làm việc' : 'Tesseract OCR đang làm việc'}_
    `, { parse_mode: 'Markdown' });
    
    // Lấy URL file
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.file_path}`;
    
    // Download ảnh
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);
    const base64Image = imageBuffer.toString('base64');
    
    let extractedText = null;
    let ocrMethod = 'unknown';
    
    // Thử dùng Gemini AI trước
    if (geminiModel) {
      try {
        const prompt = `Bạn là chuyên gia đọc bill lô đề Việt Nam. Hãy phân tích hình ảnh và trích xuất CHÍNH XÁC nội dung bill.

QUY TẮC:
1. Chỉ trích xuất các dòng chứa số đánh và kiểu chơi
2. Bỏ qua header, footer, logo, watermark
3. Format mỗi dòng: [các số] [kiểu chơi] [điểm]d [đài]

CÁC KIỂU CHƠI: bl2, bl3, bl4, bd (bao đảo), da, dv (đá vòng), dau, duoi, xien
LOẠI ĐÀI: 1dai, 2dai, hn (Hà Nội)

VÍ DỤ OUTPUT:
23 45 67 bl2 10d 1dai
89 12 bd 5d hn

CHỈ TRẢ VỀ NỘI DUNG BILL ĐÃ CHUẨN HÓA, KHÔNG GIẢI THÍCH.
Nếu không đọc được, trả về: KHONG_DOC_DUOC`;

        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        };
        
        const result = await geminiModel.generateContent([prompt, imagePart]);
        const aiResponse = await result.response;
        extractedText = aiResponse.text().trim();
        
        if (extractedText === 'KHONG_DOC_DUOC') {
          extractedText = null;
        } else {
          ocrMethod = 'gemini';
        }
      } catch (aiError) {
        console.log('⚠️ Gemini AI error:', aiError.message);
        // Sẽ fallback sang Tesseract bên dưới
      }
    }
    
    // Fallback: Dùng Tesseract OCR nếu Gemini không đọc được
    if (!extractedText) {
      try {
        console.log('📖 Đang fallback sang Tesseract OCR...');
        await bot.editMessageText(`
🔍 *ĐANG ĐỌC ẢNH...*
━━━━━━━━━━━━━━━━━━━━━━
${geminiModel ? '⚠️ AI không đọc được, đang dùng Tesseract...' : '📖 Tesseract OCR đang đọc...'}
        `, { 
          chat_id: chatId, 
          message_id: processingMsg.message_id,
          parse_mode: 'Markdown'
        }).catch(() => {});
        
        const base64WithPrefix = `data:image/jpeg;base64,${base64Image}`;
        const tesseractResult = await extractTextWithTesseract(base64WithPrefix);
        
        if (tesseractResult.success && tesseractResult.text) {
          extractedText = tesseractResult.text;
          ocrMethod = 'tesseract';
        }
      } catch (tesseractError) {
        console.log('❌ Tesseract error:', tesseractError.message);
      }
    }
    
    // Xóa message đang xử lý
    await bot.deleteMessage(chatId, processingMsg.message_id).catch(() => {});
    
    if (extractedText) {
      // Parse và tính bill
      try {
        const bill = parseBillText(extractedText);
        const { tongThu, chiTietTungDong } = calculateRevenue(bill);
        
        // Format chi tiết
        let chiTietText = '';
        chiTietTungDong.forEach((ct, i) => {
          chiTietText += `${i+1}. ${ct.moTa}\n   → Thu: ${ct.tienThuFormatted}\n`;
        });
        
        // Lưu để có thể save sau
        userStates.set(userId, {
          state: 'confirm_ai_bill',
          extractedText,
          bill,
          tongThu
        });
        
        const methodIcon = ocrMethod === 'gemini' ? '🤖 Gemini AI' : '📖 Tesseract OCR';
        
        bot.sendMessage(chatId, `
${methodIcon} *ĐÃ ĐỌC VÀ TÍNH BILL*
━━━━━━━━━━━━━━━━━━━━━━

📝 *Nội dung nhận dạng:*
\`\`\`
${extractedText}
\`\`\`

📊 *Chi tiết:*
${chiTietText}
━━━━━━━━━━━━━━━━━━━━━━
💰 *TỔNG THU: ${formatMoney(tongThu)}*

✅ Gửi *LƯU* để lưu bill này
✏️ Gửi bill đã sửa nếu cần chỉnh
❌ Gửi /cancel để hủy
        `, { parse_mode: 'Markdown' });
        
      } catch (calcError) {
        // Có text nhưng không parse được bill
        userStates.set(userId, {
          state: 'waiting_bill',
          extractedText
        });
        
        const methodIcon = ocrMethod === 'gemini' ? '🤖 AI' : '📖 Tesseract';
        
        bot.sendMessage(chatId, `
${methodIcon} *ĐỌC ĐƯỢC:*
━━━━━━━━━━━━━━━━━━━━━━

\`\`\`
${extractedText}
\`\`\`

⚠️ Không nhận dạng được format bill.
Vui lòng gửi lại bill theo format:
\`23 45 67 bl2 10d 1dai\`
        `, { parse_mode: 'Markdown' });
      }
    } else {
      // Cả AI và Tesseract đều không đọc được
      userStates.set(userId, { state: 'waiting_bill' });
      
      bot.sendMessage(chatId, `
📷 *KHÔNG ĐỌC ĐƯỢC ẢNH*
━━━━━━━━━━━━━━━━━━━━━━

${!geminiModel ? '⚠️ Chưa cấu hình Gemini API Key\n' : ''}
🤖 AI và 📖 Tesseract đều không đọc được.
Ảnh có thể không rõ hoặc không có nội dung bill.

📝 Vui lòng nhập bill thủ công:
\`23 45 67 bl2 10d 1dai\`
      `, { parse_mode: 'Markdown' });
    }
    
  } catch (error) {
    console.error('Photo handling error:', error);
    bot.sendMessage(chatId, '❌ Có lỗi khi xử lý ảnh. Vui lòng thử lại hoặc nhập text.');
  }
});

/**
 * Xử lý tin nhắn text (không phải command)
 */
bot.on('message', async (msg) => {
  // Bỏ qua commands
  if (msg.text?.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const text = msg.text;
  
  if (!text) return;
  
  // Check auth (trừ khi đang đợi đăng nhập)
  const userState = userStates.get(userId);
  if (!userState && !isAuthenticated(userId)) {
    bot.sendMessage(chatId, `
🔐 Vui lòng đăng nhập trước: /login <mật khẩu>
    `, { parse_mode: 'Markdown' });
    return;
  }
  
  if (!userState) return;
  
  // Xử lý theo state
  switch (userState.state) {
    case 'waiting_bill':
    case 'waiting_bill_text_from_photo':
      await handleBillInput(chatId, userId, text, userState.photoFileId);
      break;
    
    case 'confirm_ocr_bill':
      // User xác nhận OCR hoặc gửi bill đã sửa
      if (text.toLowerCase() === 'ok' || text.toLowerCase() === 'yes' || text === 'có') {
        // Sử dụng bill từ OCR
        await handleBillInput(chatId, userId, userState.parsedBill, userState.photoFileId);
      } else {
        // User gửi bill đã sửa
        await handleBillInput(chatId, userId, text, userState.photoFileId);
      }
      break;
    
    case 'confirm_ai_bill':
      // User xác nhận AI bill hoặc gửi bill đã sửa
      if (text.toLowerCase() === 'lưu' || text.toLowerCase() === 'luu' || text.toLowerCase() === 'ok' || text.toLowerCase() === 'save') {
        // Lưu bill từ AI
        await saveBillFromAI(chatId, userId, userState);
      } else {
        // User gửi bill đã sửa
        await handleBillInput(chatId, userId, text, null);
      }
      break;
      
    case 'waiting_ketqua':
      await handleKetQuaInput(chatId, userId, text);
      break;
  }
});

/**
 * Lưu bill từ AI đã confirm
 */
async function saveBillFromAI(chatId, userId, state) {
  try {
    const { bill, tongThu, extractedText } = state;
    
    // Lưu vào database
    const ngay = new Date().toISOString().split('T')[0];
    const billId = billsDb.create({
      telegram_user_id: userId,
      telegram_chat_id: chatId.toString(),
      ngay: ngay,
      tong_thu: tongThu,
      raw_text: extractedText,
      photo_file_id: null
    });
    
    // Lưu chi tiết
    const { chiTietTungDong } = calculateRevenue(bill);
    const linesWithRevenue = bill.map((line, idx) => ({
      ...line,
      tienThu: chiTietTungDong[idx]?.tienThu || 0
    }));
    billLinesDb.createMany(billId, linesWithRevenue);
    
    // Reset state
    userStates.delete(userId);
    
    bot.sendMessage(chatId, `
✅ *ĐÃ LƯU BILL #${billId}*
━━━━━━━━━━━━━━━━━━━━━━
💰 *Tổng thu: ${formatMoney(tongThu)}*

📅 Ngày: ${ngay}
🤖 Xử lý bởi: Gemini AI

/bill - Tạo bill mới
/thongke - Xem thống kê
    `, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Save AI bill error:', error);
    bot.sendMessage(chatId, '❌ Lỗi lưu bill: ' + error.message);
  }
}

/**
 * Xử lý nhập bill
 */
async function handleBillInput(chatId, userId, text, photoFileId = null) {
  try {
    // Parse bill
    const bill = parseBillText(text);
    
    if (bill.length === 0) {
      bot.sendMessage(chatId, '❌ Không thể đọc bill. Vui lòng kiểm tra lại format.');
      return;
    }
    
    // Tính tiền thu
    const { tongThu, chiTietTungDong } = calculateRevenue(bill);
    
    // Lưu vào database
    const ngay = new Date().toISOString().split('T')[0];
    const billId = billsDb.create({
      telegram_user_id: userId,
      telegram_chat_id: chatId.toString(),
      ngay: ngay,
      tong_thu: tongThu,
      raw_text: text,
      photo_file_id: photoFileId
    });
    
    // Lưu chi tiết
    const linesWithRevenue = bill.map((line, idx) => ({
      ...line,
      tienThu: chiTietTungDong[idx]?.tienThu || 0
    }));
    billLinesDb.createMany(billId, linesWithRevenue);
    
    // Tạo message kết quả
    let message = `
✅ *ĐÃ NHẬN BILL #${billId}*
━━━━━━━━━━━━━━━━━━━━━━

*CHI TIẾT:*
`;
    
    chiTietTungDong.forEach((dong, idx) => {
      message += `\n${idx + 1}. \`${dong.numbers.join(', ')}\``;
      message += `\n   ${dong.congThuc}`;
      message += `\n   → *${formatMoney(dong.tienThu)}*\n`;
    });
    
    message += `
━━━━━━━━━━━━━━━━━━━━━━
💰 *TỔNG THU: ${formatMoney(tongThu)}*
━━━━━━━━━━━━━━━━━━━━━━

📌 _Tiền trả sẽ được tính khi có kết quả_
    `;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
    // Reset state
    userStates.delete(userId);
    
  } catch (error) {
    console.error('Handle bill error:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi xử lý bill');
  }
}

/**
 * Xử lý nhập kết quả xổ số
 */
async function handleKetQuaInput(chatId, userId, text) {
  try {
    // Parse kết quả
    const lines = text.trim().split('\n');
    const allNumbers = [];
    
    lines.forEach(line => {
      const numbers = line.match(/\d{2,6}/g);
      if (numbers) {
        allNumbers.push(...numbers);
      }
    });
    
    if (allNumbers.length === 0) {
      bot.sendMessage(chatId, '❌ Không tìm thấy số nào. Vui lòng kiểm tra lại.');
      return;
    }
    
    // Trích xuất lô 2 số, 3 số
    const lo2so = allNumbers.map(n => n.slice(-2));
    const lo3so = allNumbers.filter(n => n.length >= 3).map(n => n.slice(-3));
    
    // Giải đặc biệt
    const giaiDb = allNumbers.find(n => n.length >= 5) || allNumbers[0] || '';
    const dau = giaiDb.length >= 2 ? giaiDb.slice(-3, -2) : null;
    const duoi = giaiDb.length >= 1 ? giaiDb.slice(-1) : null;
    
    const ketQua = { lo2so, lo3so, dau, duoi };
    
    // Áp dụng cho bills hôm nay
    const ngay = new Date().toISOString().split('T')[0];
    const bills = billsDb.getByDate(ngay);
    const pendingBills = bills.filter(b => b.trang_thai === 'pending');
    
    let tongThuNgay = 0;
    let tongTraNgay = 0;
    const results = [];
    
    for (const bill of pendingBills) {
      const lines = billLinesDb.getByBillId(bill.id);
      const billLines = lines.map(line => ({
        numbers: line.numbers,
        diem: line.diem,
        kieuChoi: line.kieu_choi,
        loaiDai: line.loai_dai
      }));
      
      const { tongTra, chiTietTungDong } = calculatePayout(billLines, ketQua);
      const profit = calculateProfit(bill.tong_thu, tongTra);
      
      billsDb.updateResult(bill.id, {
        tong_tra: tongTra,
        loi_lo: profit.loiLo
      });
      
      tongThuNgay += bill.tong_thu;
      tongTraNgay += tongTra;
      
      results.push({
        billId: bill.id,
        tongThu: bill.tong_thu,
        tongTra,
        loiLo: profit.loiLo,
        chiTietTrung: chiTietTungDong
      });
    }
    
    const loiLoNgay = tongThuNgay - tongTraNgay;
    
    // Tạo message kết quả
    let message = `
🎰 *ĐÃ CẬP NHẬT KẾT QUẢ*
━━━━━━━━━━━━━━━━━━━━━━

*LÔ 2 SỐ (${lo2so.length}):*
\`${lo2so.join(', ')}\`

*ĐẦU:* ${dau || '-'} | *ĐUÔI:* ${duoi || '-'}

━━━━━━━━━━━━━━━━━━━━━━
*KẾT QUẢ ${pendingBills.length} BILL:*
`;
    
    results.forEach(r => {
      const emoji = r.loiLo >= 0 ? '🟢' : '🔴';
      const loiLoText = r.loiLo >= 0 ? `+${formatMoney(r.loiLo)}` : formatMoney(r.loiLo);
      message += `\n${emoji} Bill #${r.billId}: ${loiLoText}`;
      
      // Hiển thị số trúng
      if (r.chiTietTrung.length > 0) {
        r.chiTietTrung.forEach(ct => {
          message += `\n   🎯 Trúng: ${ct.numbers?.join(', ') || ct.cap?.join('-')}`;
        });
      }
    });
    
    const emojiTong = loiLoNgay >= 0 ? '🎉' : '😢';
    const ketQuaText = loiLoNgay >= 0 ? 'LỜI' : 'LỖ';
    
    message += `

━━━━━━━━━━━━━━━━━━━━━━
${emojiTong} *TỔNG KẾT NGÀY:*

💰 Tổng thu: *${formatMoney(tongThuNgay)}*
💸 Tổng trả: *${formatMoney(tongTraNgay)}*

*${ketQuaText}: ${loiLoNgay >= 0 ? '+' : ''}${formatMoney(loiLoNgay)}*
━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
    // Reset state
    userStates.delete(userId);
    
  } catch (error) {
    console.error('Handle ketqua error:', error);
    bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi xử lý kết quả');
  }
}

// ================================================================
// ERROR HANDLING
// ================================================================

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

console.log(`
╔══════════════════════════════════════════════════╗
║         THẦU CALCULATOR - TELEGRAM BOT           ║
╠══════════════════════════════════════════════════╣
║  🤖 Bot đang hoạt động...                        ║
║  📝 Commands: /bill, /ketqua, /thongke           ║
╚══════════════════════════════════════════════════╝
`);

export default bot;
