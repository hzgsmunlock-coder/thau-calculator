/**
 * ================================================================
 * CALCULATOR - LOGIC TÍNH TOÁN CHO THẦU
 * ================================================================
 * 
 * File này chứa các hàm tính toán chính:
 * - calculateRevenue(): Tính tiền THU từ khách
 * - calculatePayout(): Tính tiền TRẢ khi khách trúng
 * - calculateProfit(): Tính LỜI/LỖ cho thầu
 * 
 * QUAN TRỌNG: 
 * - Logic từ góc độ THẦU (không phải người chơi)
 * - Điểm chỉ là đơn vị quy ước, không phải tiền
 */

import {
  KIEU_CHOI,
  LOAI_DAI,
  layHeSoThu,
  layTienThuong,
  tinhSoDao,
  taoSoDao,
  tinhSoCapDa,
  taoCapDa
} from '../config/constants.js';

// ================================================================
// HÀM TÍNH TIỀN THU (REVENUE)
// ================================================================

/**
 * Tính tiền thầu thu từ 1 dòng bill
 * 
 * @param {Object} line - Dòng bill
 * @param {string[]} line.numbers - Mảng số đánh
 * @param {number} line.diem - Số điểm
 * @param {string} line.kieuChoi - Kiểu chơi
 * @param {string} line.loaiDai - Loại đài
 * @returns {Object} { tienThu, chiTiet }
 * 
 * CÔNG THỨC THU:
 * - Bao thường: điểm × hệ_số
 * - Bao đảo: điểm × số_đảo × hệ_số
 * - Đá vòng: điểm × số_cặp × hệ_số
 */
export function calculateLineRevenue(line) {
  const { numbers, diem, kieuChoi, loaiDai } = line;
  const heSo = layHeSoThu(kieuChoi, loaiDai);
  
  let tienThu = 0;
  let chiTiet = {
    numbers: numbers,
    diem: diem,
    kieuChoi: kieuChoi,
    loaiDai: loaiDai,
    heSo: heSo
  };
  
  switch (kieuChoi) {
    // Bao lô thường - mỗi số tính riêng
    case KIEU_CHOI.BAO_LO_2:
    case KIEU_CHOI.BAO_LO_3:
    case KIEU_CHOI.DAU:
    case KIEU_CHOI.DUOI:
      // Mỗi số × điểm × hệ số
      tienThu = numbers.length * diem * heSo;
      chiTiet.soLuongSo = numbers.length;
      chiTiet.congThuc = `${numbers.length} số × ${diem} điểm × ${heSo}`;
      break;
    
    // Bao đảo - mỗi số nhân với số đảo của nó
    case KIEU_CHOI.BAO_DAO_2:
    case KIEU_CHOI.BAO_DAO_3:
      let tongSoDao = 0;
      const chiTietDao = [];
      
      numbers.forEach(num => {
        const soDao = tinhSoDao(num);
        tongSoDao += soDao;
        chiTietDao.push({ so: num, soDao: soDao });
      });
      
      tienThu = diem * tongSoDao * heSo;
      chiTiet.chiTietDao = chiTietDao;
      chiTiet.tongSoDao = tongSoDao;
      chiTiet.congThuc = `${diem} điểm × ${tongSoDao} đảo × ${heSo}`;
      break;
    
    // Đá thẳng - 2 số = 1 cặp
    case KIEU_CHOI.DA:
      tienThu = diem * heSo;
      chiTiet.soCap = 1;
      chiTiet.congThuc = `${diem} điểm × ${heSo}`;
      break;
    
    // Đá vòng - nhiều số tạo nhiều cặp
    case KIEU_CHOI.DA_VONG:
      const soCap = tinhSoCapDa(numbers);
      tienThu = diem * soCap * heSo;
      chiTiet.soCap = soCap;
      chiTiet.cacCap = taoCapDa(numbers);
      chiTiet.congThuc = `${diem} điểm × ${soCap} cặp × ${heSo}`;
      break;
    
    default:
      tienThu = numbers.length * diem * heSo;
  }
  
  // Chuyển đổi sang VNĐ (hệ số tính theo đơn vị K = 1000đ)
  tienThu = tienThu * 1000;
  
  chiTiet.tienThu = tienThu;
  return { tienThu, chiTiet };
}

/**
 * Tính tổng tiền thu từ toàn bộ bill
 * 
 * @param {Object[]} bill - Mảng các dòng bill
 * @returns {Object} { tongThu, chiTietTungDong }
 */
export function calculateRevenue(bill) {
  let tongThu = 0;
  const chiTietTungDong = [];
  
  bill.forEach((line, index) => {
    const { tienThu, chiTiet } = calculateLineRevenue(line);
    tongThu += tienThu;
    chiTietTungDong.push({
      dong: index + 1,
      ...chiTiet
    });
  });
  
  return {
    tongThu,
    chiTietTungDong
  };
}

// ================================================================
// HÀM TÍNH TIỀN TRẢ (PAYOUT)
// ================================================================

/**
 * Kiểm tra số có trúng với kết quả không
 * 
 * @param {string} so - Số đã đánh
 * @param {string[]} ketQua - Mảng kết quả xổ số (2 số cuối)
 * @param {string} kieuChoi - Kiểu chơi
 * @returns {number} Số lần trúng
 */
export function kiemTraTrung(so, ketQua, kieuChoi) {
  let soLanTrung = 0;
  
  // Với bao đảo, tạo tất cả số đảo rồi kiểm tra từng số
  if (kieuChoi === KIEU_CHOI.BAO_DAO_2 || kieuChoi === KIEU_CHOI.BAO_DAO_3) {
    const cacSoDao = taoSoDao(so);
    cacSoDao.forEach(soDao => {
      ketQua.forEach(kq => {
        if (soDao === kq) soLanTrung++;
      });
    });
  } else {
    // Kiểm tra trực tiếp
    ketQua.forEach(kq => {
      if (so === kq) soLanTrung++;
    });
  }
  
  return soLanTrung;
}

/**
 * Kiểm tra cặp đá có trúng không
 * Cặp đá trúng khi CẢ HAI số đều xuất hiện trong kết quả
 * 
 * @param {string} so1 - Số thứ nhất
 * @param {string} so2 - Số thứ hai  
 * @param {string[]} ketQua - Mảng kết quả xổ số
 * @returns {boolean} True nếu cả 2 số đều có trong kết quả
 */
export function kiemTraDaTrung(so1, so2, ketQua) {
  const co1 = ketQua.includes(so1);
  const co2 = ketQua.includes(so2);
  return co1 && co2;
}

/**
 * Tính tiền trả cho 1 dòng bill khi có kết quả
 * 
 * @param {Object} line - Dòng bill
 * @param {Object} ketQua - Kết quả xổ số theo đài
 * @param {string[]} ketQua.lo2so - Mảng 2 số cuối các giải
 * @param {string[]} ketQua.lo3so - Mảng 3 số cuối (nếu có)
 * @param {string} ketQua.dau - Số đầu giải đặc biệt
 * @param {string} ketQua.duoi - Số đuôi giải đặc biệt
 * @returns {Object} { tienTra, chiTietTrung }
 */
export function calculateLinePayout(line, ketQua) {
  const { numbers, diem, kieuChoi, loaiDai } = line;
  const tienThuong = layTienThuong(kieuChoi);
  
  let tienTra = 0;
  const chiTietTrung = [];
  
  // Lấy kết quả phù hợp với loại đài
  // Với đơn giản, dùng ketQua.lo2so cho BL2, ketQua.lo3so cho BL3
  let kq2So = ketQua.lo2so || [];
  let kq3So = ketQua.lo3so || [];
  
  switch (kieuChoi) {
    case KIEU_CHOI.BAO_LO_2:
    case KIEU_CHOI.BAO_DAO_2:
      numbers.forEach(so => {
        let soLanTrung = 0;
        
        if (kieuChoi === KIEU_CHOI.BAO_DAO_2) {
          // Bao đảo: kiểm tra tất cả số đảo
          const cacSoDao = taoSoDao(so);
          cacSoDao.forEach(soDao => {
            const lanTrung = kq2So.filter(kq => kq === soDao).length;
            soLanTrung += lanTrung;
          });
        } else {
          // Bao thường
          soLanTrung = kq2So.filter(kq => kq === so).length;
        }
        
        if (soLanTrung > 0) {
          const tienSoNay = diem * tienThuong * soLanTrung;
          tienTra += tienSoNay;
          chiTietTrung.push({
            so: so,
            soLanTrung: soLanTrung,
            tienThuong: tienThuong,
            tienTra: tienSoNay
          });
        }
      });
      break;
    
    case KIEU_CHOI.BAO_LO_3:
    case KIEU_CHOI.BAO_DAO_3:
      numbers.forEach(so => {
        let soLanTrung = 0;
        
        if (kieuChoi === KIEU_CHOI.BAO_DAO_3) {
          const cacSoDao = taoSoDao(so);
          cacSoDao.forEach(soDao => {
            const lanTrung = kq3So.filter(kq => kq === soDao).length;
            soLanTrung += lanTrung;
          });
        } else {
          soLanTrung = kq3So.filter(kq => kq === so).length;
        }
        
        if (soLanTrung > 0) {
          const tienSoNay = diem * tienThuong * soLanTrung;
          tienTra += tienSoNay;
          chiTietTrung.push({
            so: so,
            soLanTrung: soLanTrung,
            tienThuong: tienThuong,
            tienTra: tienSoNay
          });
        }
      });
      break;
    
    case KIEU_CHOI.DAU:
      numbers.forEach(so => {
        if (ketQua.dau && so === ketQua.dau) {
          const tienSoNay = diem * tienThuong;
          tienTra += tienSoNay;
          chiTietTrung.push({
            so: so,
            loai: 'dau',
            tienTra: tienSoNay
          });
        }
      });
      break;
    
    case KIEU_CHOI.DUOI:
      numbers.forEach(so => {
        if (ketQua.duoi && so === ketQua.duoi) {
          const tienSoNay = diem * tienThuong;
          tienTra += tienSoNay;
          chiTietTrung.push({
            so: so,
            loai: 'duoi',
            tienTra: tienSoNay
          });
        }
      });
      break;
    
    case KIEU_CHOI.DA:
      // Đá thẳng: 2 số
      if (numbers.length >= 2) {
        if (kiemTraDaTrung(numbers[0], numbers[1], kq2So)) {
          const tienCapNay = diem * tienThuong;
          tienTra += tienCapNay;
          chiTietTrung.push({
            cap: [numbers[0], numbers[1]],
            tienTra: tienCapNay
          });
        }
      }
      break;
    
    case KIEU_CHOI.DA_VONG:
      // Đá vòng: kiểm tra từng cặp
      const cacCap = taoCapDa(numbers);
      cacCap.forEach(cap => {
        if (kiemTraDaTrung(cap[0], cap[1], kq2So)) {
          const tienCapNay = diem * tienThuong;
          tienTra += tienCapNay;
          chiTietTrung.push({
            cap: cap,
            tienTra: tienCapNay
          });
        }
      });
      break;
  }
  
  return {
    tienTra,
    chiTietTrung,
    soLuongTrung: chiTietTrung.length
  };
}

/**
 * Tính tổng tiền trả cho toàn bộ bill
 * 
 * @param {Object[]} bill - Mảng các dòng bill
 * @param {Object} ketQua - Kết quả xổ số
 * @returns {Object} { tongTra, chiTietTungDong }
 */
export function calculatePayout(bill, ketQua) {
  let tongTra = 0;
  const chiTietTungDong = [];
  
  bill.forEach((line, index) => {
    const { tienTra, chiTietTrung, soLuongTrung } = calculateLinePayout(line, ketQua);
    tongTra += tienTra;
    
    if (soLuongTrung > 0) {
      chiTietTungDong.push({
        dong: index + 1,
        numbers: line.numbers,
        kieuChoi: line.kieuChoi,
        tienTra: tienTra,
        chiTietTrung: chiTietTrung
      });
    }
  });
  
  return {
    tongTra,
    chiTietTungDong
  };
}

// ================================================================
// HÀM TÍNH LỜI/LỖ (PROFIT)
// ================================================================

/**
 * Tính lời/lỗ cho thầu
 * 
 * @param {number} tongThu - Tổng tiền thu từ khách
 * @param {number} tongTra - Tổng tiền trả cho khách
 * @returns {Object} { loiLo, ketQua, tyLe }
 * 
 * LOGIC THẦU:
 * - Lời = Thu > Trả → thầu có lãi
 * - Lỗ = Thu < Trả → thầu bị lỗ
 */
export function calculateProfit(tongThu, tongTra) {
  const loiLo = tongThu - tongTra;
  
  return {
    tongThu: tongThu,
    tongTra: tongTra,
    loiLo: loiLo,
    ketQua: loiLo >= 0 ? 'LOI' : 'LO',
    ketQuaText: loiLo >= 0 ? `LỜI +${formatMoney(loiLo)}` : `LỖ ${formatMoney(loiLo)}`,
    tyLe: tongThu > 0 ? ((loiLo / tongThu) * 100).toFixed(2) : 0
  };
}

/**
 * Tính toán đầy đủ cho 1 bill
 * 
 * @param {Object[]} bill - Mảng các dòng bill
 * @param {Object} ketQua - Kết quả xổ số (optional)
 * @returns {Object} Kết quả đầy đủ
 */
export function calculateBill(bill, ketQua = null) {
  // Tính tiền thu
  const { tongThu, chiTietTungDong: chiTietThu } = calculateRevenue(bill);
  
  let result = {
    bill: bill,
    thu: {
      tong: tongThu,
      chiTiet: chiTietThu
    }
  };
  
  // Nếu có kết quả, tính tiền trả
  if (ketQua) {
    const { tongTra, chiTietTungDong: chiTietTra } = calculatePayout(bill, ketQua);
    const profit = calculateProfit(tongThu, tongTra);
    
    result.tra = {
      tong: tongTra,
      chiTiet: chiTietTra
    };
    result.ketQua = profit;
  }
  
  return result;
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Format số tiền theo định dạng VNĐ (làm tròn lên đến 1000đ)
 */
export function formatMoney(amount) {
  // Làm tròn lên đến 1000đ
  const rounded = Math.ceil(amount / 1000) * 1000;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(rounded);
}

/**
 * Parse bill từ text input
 * Hỗ trợ nhiều định dạng nhập
 * 
 * @param {string} text - Text bill từ người dùng
 * @returns {Object[]} Mảng các dòng bill đã parse
 */
export function parseBillText(text) {
  const lines = text.trim().split('\n');
  const bill = [];
  
  // Pattern nhận diện các dòng bill
  // Ví dụ: "23 45 67 bl2 10d 1dai"
  // Hoặc: "23,45,67 bao lo 2 10 diem mot dai"
  
  lines.forEach(line => {
    const trimmed = line.trim().toLowerCase();
    if (!trimmed) return;
    
    // Phân tích dòng
    const parsed = parseLineBill(trimmed);
    if (parsed) {
      bill.push(parsed);
    }
  });
  
  return bill;
}

/**
 * Parse 1 dòng bill
 */
function parseLineBill(line) {
  // Chuẩn hóa input
  let normalized = line
    .replace(/,/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Tìm số đánh (2-3 chữ số liên tiếp)
  const numberPattern = /\b(\d{2,3})\b/g;
  const numbers = [];
  let match;
  while ((match = numberPattern.exec(normalized)) !== null) {
    numbers.push(match[1]);
  }
  
  if (numbers.length === 0) return null;
  
  // Tìm số điểm
  let diem = 1;
  const diemMatch = normalized.match(/(\d+)\s*(d|đ|diem|điểm)/i);
  if (diemMatch) {
    diem = parseInt(diemMatch[1]);
  }
  
  // Xác định kiểu chơi
  let kieuChoi = KIEU_CHOI.BAO_LO_2;
  
  if (/đảo|dao|bd/.test(normalized)) {
    kieuChoi = numbers[0].length === 3 ? KIEU_CHOI.BAO_DAO_3 : KIEU_CHOI.BAO_DAO_2;
  } else if (/đá vòng|da vong|dv/.test(normalized)) {
    kieuChoi = KIEU_CHOI.DA_VONG;
  } else if (/đá|da\b/.test(normalized)) {
    kieuChoi = numbers.length > 2 ? KIEU_CHOI.DA_VONG : KIEU_CHOI.DA;
  } else if (/đầu|dau/.test(normalized)) {
    kieuChoi = KIEU_CHOI.DAU;
  } else if (/đuôi|duoi/.test(normalized)) {
    kieuChoi = KIEU_CHOI.DUOI;
  } else if (/bl3|bao lo 3|bao lô 3|3 số|3so/.test(normalized)) {
    kieuChoi = KIEU_CHOI.BAO_LO_3;
  } else if (/bl2|bao lo 2|bao lô 2|bl|bao lo/.test(normalized)) {
    kieuChoi = KIEU_CHOI.BAO_LO_2;
  }
  
  // Xác định loại đài
  let loaiDai = LOAI_DAI.MOT_DAI;
  
  if (/hà nội|ha noi|hn/.test(normalized)) {
    loaiDai = LOAI_DAI.HA_NOI;
  } else if (/2 đài|2 dai|2dai|2đài|hai đài/.test(normalized)) {
    loaiDai = LOAI_DAI.HAI_DAI;
  } else if (/chung|bc/.test(normalized)) {
    loaiDai = LOAI_DAI.BAO_CHUNG;
  } else if (/1 đài|1 dai|1dai|1đài|một đài|mot dai/.test(normalized)) {
    loaiDai = LOAI_DAI.MOT_DAI;
  }
  
  return {
    numbers,
    diem,
    kieuChoi,
    loaiDai,
    raw: line
  };
}

export default {
  calculateLineRevenue,
  calculateRevenue,
  calculateLinePayout,
  calculatePayout,
  calculateProfit,
  calculateBill,
  formatMoney,
  parseBillText
};
