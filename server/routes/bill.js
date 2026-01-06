/**
 * ================================================================
 * BILL ROUTES - API xử lý bill
 * ================================================================
 */

import express from 'express';
import {
  calculateBill,
  calculateRevenue,
  calculatePayout,
  calculateProfit,
  parseBillText,
  formatMoney
} from '../lib/calculator.js';
import { billsDb, billLinesDb, ketQuaDb } from '../db/database.js';
import { extractBillFromImage, smartCalculateBill } from '../lib/geminiAI.js';
import { extractTextWithTesseract } from '../lib/localOCR.js';

const router = express.Router();

/**
 * POST /api/bill/calculate
 * Tính toán bill mà không lưu
 */
router.post('/calculate', (req, res) => {
  try {
    const { bill, ketQua } = req.body;
    
    if (!bill || !Array.isArray(bill)) {
      return res.status(400).json({ 
        error: 'Bill phải là mảng các dòng' 
      });
    }
    
    const result = calculateBill(bill, ketQua);
    res.json(result);
    
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/parse
 * Parse bill từ text
 */
router.post('/parse', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Thiếu nội dung bill' });
    }
    
    const bill = parseBillText(text);
    const { tongThu, chiTietTungDong } = calculateRevenue(bill);
    
    res.json({
      bill,
      tongThu,
      tongThuFormatted: formatMoney(tongThu),
      chiTiet: chiTietTungDong
    });
    
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/ocr
 * Đọc bill từ hình ảnh - Thử AI trước, fallback về Tesseract
 */
router.post('/ocr', async (req, res) => {
  try {
    const { image, mimeType, useLocal } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh' });
    }

    let ocrResult;
    let method = 'unknown';

    // Nếu yêu cầu dùng local hoặc không có API key
    if (useLocal || !process.env.GEMINI_API_KEY) {
      console.log('📖 Sử dụng Tesseract OCR (local)...');
      ocrResult = await extractTextWithTesseract(image);
      method = 'tesseract';
    } else {
      // Thử Gemini AI trước
      console.log('🤖 Thử Gemini AI...');
      ocrResult = await extractBillFromImage(image, mimeType || 'image/jpeg');
      method = 'gemini';
      
      // Nếu AI thất bại (quota, lỗi), fallback về Tesseract
      if (!ocrResult.success && ocrResult.error?.includes('quota')) {
        console.log('⚠️ AI quota hết, chuyển sang Tesseract...');
        ocrResult = await extractTextWithTesseract(image);
        method = 'tesseract-fallback';
      }
    }
    
    if (!ocrResult.success) {
      return res.status(400).json({ error: ocrResult.error });
    }

    // Parse the extracted text
    const bill = parseBillText(ocrResult.text);
    const { tongThu, chiTietTungDong } = calculateRevenue(bill);

    res.json({
      success: true,
      method,
      extractedText: ocrResult.text,
      rawText: ocrResult.rawText,
      bill,
      tongThu,
      tongThuFormatted: formatMoney(tongThu),
      chiTiet: chiTietTungDong
    });

  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/ocr-local
 * Đọc bill chỉ bằng Tesseract (không dùng AI)
 */
router.post('/ocr-local', async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh' });
    }

    const ocrResult = await extractTextWithTesseract(image);
    
    if (!ocrResult.success) {
      return res.status(400).json({ error: ocrResult.error });
    }

    // Parse the extracted text
    const bill = parseBillText(ocrResult.text);
    const { tongThu, chiTietTungDong } = calculateRevenue(bill);

    res.json({
      success: true,
      method: 'tesseract',
      extractedText: ocrResult.text,
      rawText: ocrResult.rawText,
      bill,
      tongThu,
      tongThuFormatted: formatMoney(tongThu),
      chiTiet: chiTietTungDong
    });

  } catch (error) {
    console.error('Local OCR error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/smart-calc
 * Tính bill thông minh - AI tự phân tích và tính toán
 */
router.post('/smart-calc', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Thiếu dữ liệu hình ảnh' });
    }

    const result = await smartCalculateBill(image, mimeType || 'image/jpeg');
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      ...result.analysis
    });

  } catch (error) {
    console.error('Smart calc error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/create
 * Tạo và lưu bill mới
 */
router.post('/create', (req, res) => {
  try {
    const { text, bill: billData, telegramUserId, telegramChatId, ngay } = req.body;
    
    // Parse bill từ text nếu có
    let bill = billData;
    if (text && !bill) {
      bill = parseBillText(text);
    }
    
    if (!bill || bill.length === 0) {
      return res.status(400).json({ error: 'Bill trống hoặc không hợp lệ' });
    }
    
    // Tính tiền thu
    const { tongThu, chiTietTungDong } = calculateRevenue(bill);
    
    // Lưu vào database
    const billId = billsDb.create({
      telegram_user_id: telegramUserId || null,
      telegram_chat_id: telegramChatId || null,
      ngay: ngay || new Date().toISOString().split('T')[0],
      tong_thu: tongThu,
      raw_text: text || JSON.stringify(bill)
    });
    
    // Lưu chi tiết từng dòng
    const linesWithRevenue = bill.map((line, idx) => ({
      ...line,
      tienThu: chiTietTungDong[idx]?.tienThu || 0
    }));
    billLinesDb.createMany(billId, linesWithRevenue);
    
    res.json({
      success: true,
      billId,
      tongThu,
      tongThuFormatted: formatMoney(tongThu),
      chiTiet: chiTietTungDong
    });
    
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/bill/:id
 * Lấy thông tin bill
 */
router.get('/:id', (req, res) => {
  try {
    const bill = billsDb.getById(req.params.id);
    if (!bill) {
      return res.status(404).json({ error: 'Không tìm thấy bill' });
    }
    
    const lines = billLinesDb.getByBillId(req.params.id);
    
    res.json({
      bill,
      lines,
      tongThuFormatted: formatMoney(bill.tong_thu),
      tongTraFormatted: formatMoney(bill.tong_tra),
      loiLoFormatted: formatMoney(bill.loi_lo)
    });
    
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/bill/:id
 * Xóa bill
 */
router.delete('/:id', (req, res) => {
  try {
    billsDb.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/bill/date/:date
 * Lấy tất cả bills theo ngày
 */
router.get('/date/:date', (req, res) => {
  try {
    const bills = billsDb.getByDate(req.params.date);
    const stats = billsDb.getStatsByDate(req.params.date);
    
    res.json({
      bills,
      stats: {
        ...stats,
        tongThuFormatted: formatMoney(stats?.tong_thu || 0),
        tongTraFormatted: formatMoney(stats?.tong_tra || 0),
        loiLoFormatted: formatMoney(stats?.loi_lo || 0)
      }
    });
    
  } catch (error) {
    console.error('Get bills by date error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/bill/:id/result
 * Cập nhật kết quả cho bill
 */
router.post('/:id/result', (req, res) => {
  try {
    const { ketQua } = req.body;
    const billId = req.params.id;
    
    // Lấy thông tin bill
    const bill = billsDb.getById(billId);
    if (!bill) {
      return res.status(404).json({ error: 'Không tìm thấy bill' });
    }
    
    // Lấy các dòng bill
    const lines = billLinesDb.getByBillId(billId);
    
    // Chuyển đổi format
    const billLines = lines.map(line => ({
      numbers: line.numbers,
      diem: line.diem,
      kieuChoi: line.kieu_choi,
      loaiDai: line.loai_dai
    }));
    
    // Tính tiền trả
    const { tongTra, chiTietTungDong } = calculatePayout(billLines, ketQua);
    const profit = calculateProfit(bill.tong_thu, tongTra);
    
    // Cập nhật database
    billsDb.updateResult(billId, {
      tong_tra: tongTra,
      loi_lo: profit.loiLo
    });
    
    res.json({
      success: true,
      tongThu: bill.tong_thu,
      tongTra,
      loiLo: profit.loiLo,
      ketQua: profit.ketQua,
      ketQuaText: profit.ketQuaText,
      chiTietTrung: chiTietTungDong
    });
    
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
