/**
 * ================================================================
 * KẾT QUẢ ROUTES - API xử lý kết quả xổ số
 * ================================================================
 */

import express from 'express';
import { ketQuaDb, billsDb, billLinesDb } from '../db/database.js';
import { calculatePayout, calculateProfit, formatMoney } from '../lib/calculator.js';

const router = express.Router();

/**
 * Xử lý kết quả xổ số thành format chuẩn
 * Trích xuất 2 số cuối, 3 số cuối từ các giải
 */
function processKetQua(rawResult) {
  const lo2so = [];
  const lo3so = [];
  
  // Các giải có thể có nhiều số
  const giaiFields = ['giai_db', 'giai_1', 'giai_2', 'giai_3', 'giai_4', 'giai_5', 'giai_6', 'giai_7'];
  
  giaiFields.forEach(field => {
    const value = rawResult[field];
    if (value) {
      // Tách các số (có thể cách nhau bởi dấu phẩy, cách, -)
      const numbers = value.split(/[,\s\-]+/).filter(n => n.length >= 2);
      numbers.forEach(num => {
        // Lấy 2 số cuối
        lo2so.push(num.slice(-2));
        // Lấy 3 số cuối nếu có đủ
        if (num.length >= 3) {
          lo3so.push(num.slice(-3));
        }
      });
    }
  });
  
  // Xác định đầu và đuôi từ giải đặc biệt
  let dau = null;
  let duoi = null;
  if (rawResult.giai_db) {
    const db = rawResult.giai_db.split(/[,\s\-]+/)[0];
    if (db && db.length >= 2) {
      dau = db.slice(-3, -2); // Số hàng chục
      duoi = db.slice(-1);     // Số hàng đơn vị
    }
  }
  
  return {
    lo2so,
    lo3so,
    dau,
    duoi
  };
}

/**
 * POST /api/ketqua/save
 * Lưu kết quả xổ số
 */
router.post('/save', (req, res) => {
  try {
    const { ngay, dai, giai_db, giai_1, giai_2, giai_3, giai_4, giai_5, giai_6, giai_7 } = req.body;
    
    if (!ngay || !dai) {
      return res.status(400).json({ error: 'Thiếu ngày hoặc đài' });
    }
    
    const rawResult = { giai_db, giai_1, giai_2, giai_3, giai_4, giai_5, giai_6, giai_7 };
    const processed = processKetQua(rawResult);
    
    ketQuaDb.save({
      ngay,
      dai,
      giai_db: giai_db || '',
      giai_1: giai_1 || '',
      giai_2: giai_2 || '',
      giai_3: giai_3 || '',
      giai_4: giai_4 || '',
      giai_5: giai_5 || '',
      giai_6: giai_6 || '',
      giai_7: giai_7 || '',
      lo_2_so: JSON.stringify(processed.lo2so),
      lo_3_so: JSON.stringify(processed.lo3so),
      dau: processed.dau,
      duoi: processed.duoi
    });
    
    res.json({
      success: true,
      processed
    });
    
  } catch (error) {
    console.error('Save ketqua error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ketqua/parse
 * Parse kết quả từ text (format linh hoạt)
 */
router.post('/parse', (req, res) => {
  try {
    const { text, ngay, dai } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Thiếu nội dung kết quả' });
    }
    
    // Parse text thành các giải
    const lines = text.trim().split('\n');
    const result = {
      ngay: ngay || new Date().toISOString().split('T')[0],
      dai: dai || 'MB'
    };
    
    // Tìm các số trong text
    const allNumbers = [];
    lines.forEach(line => {
      const numbers = line.match(/\d{2,6}/g);
      if (numbers) {
        allNumbers.push(...numbers);
      }
    });
    
    // Trích xuất 2 số cuối và 3 số cuối
    const lo2so = allNumbers.map(n => n.slice(-2));
    const lo3so = allNumbers.filter(n => n.length >= 3).map(n => n.slice(-3));
    
    // Giải đặc biệt thường là số dài nhất hoặc dòng đầu
    const giaiDb = allNumbers.find(n => n.length >= 5) || allNumbers[0] || '';
    const dau = giaiDb.length >= 2 ? giaiDb.slice(-3, -2) : null;
    const duoi = giaiDb.length >= 1 ? giaiDb.slice(-1) : null;
    
    res.json({
      ngay: result.ngay,
      dai: result.dai,
      lo2so,
      lo3so,
      dau,
      duoi,
      raw: allNumbers
    });
    
  } catch (error) {
    console.error('Parse ketqua error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ketqua/:ngay
 * Lấy kết quả theo ngày
 */
router.get('/:ngay', (req, res) => {
  try {
    const results = ketQuaDb.getByDate(req.params.ngay);
    res.json(results);
  } catch (error) {
    console.error('Get ketqua error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ketqua/:ngay/:dai
 * Lấy kết quả theo ngày và đài
 */
router.get('/:ngay/:dai', (req, res) => {
  try {
    const result = ketQuaDb.getByDateAndDai(req.params.ngay, req.params.dai);
    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy kết quả' });
    }
    res.json(result);
  } catch (error) {
    console.error('Get ketqua error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ketqua/apply/:ngay
 * Áp dụng kết quả cho tất cả bills trong ngày
 */
router.post('/apply/:ngay', async (req, res) => {
  try {
    const ngay = req.params.ngay;
    const { ketQua } = req.body;
    
    if (!ketQua) {
      return res.status(400).json({ error: 'Thiếu kết quả xổ số' });
    }
    
    // Lấy tất cả bills pending trong ngày
    const bills = billsDb.getByDate(ngay);
    const pendingBills = bills.filter(b => b.trang_thai === 'pending');
    
    const results = [];
    
    for (const bill of pendingBills) {
      // Lấy các dòng bill
      const lines = billLinesDb.getByBillId(bill.id);
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
      billsDb.updateResult(bill.id, {
        tong_tra: tongTra,
        loi_lo: profit.loiLo
      });
      
      results.push({
        billId: bill.id,
        tongThu: bill.tong_thu,
        tongTra,
        loiLo: profit.loiLo,
        ketQua: profit.ketQua
      });
    }
    
    // Tính tổng cho ngày
    const tongNgay = results.reduce((acc, r) => ({
      tongThu: acc.tongThu + r.tongThu,
      tongTra: acc.tongTra + r.tongTra,
      loiLo: acc.loiLo + r.loiLo
    }), { tongThu: 0, tongTra: 0, loiLo: 0 });
    
    res.json({
      success: true,
      soBill: results.length,
      chiTiet: results,
      tongNgay: {
        ...tongNgay,
        tongThuFormatted: formatMoney(tongNgay.tongThu),
        tongTraFormatted: formatMoney(tongNgay.tongTra),
        loiLoFormatted: formatMoney(tongNgay.loiLo),
        ketQua: tongNgay.loiLo >= 0 ? 'LOI' : 'LO'
      }
    });
    
  } catch (error) {
    console.error('Apply ketqua error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
