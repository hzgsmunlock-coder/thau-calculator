/**
 * ================================================================
 * CONSTANTS - Hằng số cho Frontend (Bảng giá 2024)
 * ================================================================
 */

// Loại đài
export const LOAI_DAI = {
  MOT_DAI: { value: 'MOT_DAI', label: '1 Đài', short: '1Đ' },
  HAI_DAI: { value: 'HAI_DAI', label: '2 Đài', short: '2Đ' },
  HA_NOI: { value: 'HA_NOI', label: 'Hà Nội', short: 'HN' },
  BAO_CHUNG: { value: 'BAO_CHUNG', label: 'Bao Chung', short: 'BC' }
};

// Kiểu chơi
export const KIEU_CHOI = {
  BAO_LO_2: { value: 'BAO_LO_2', label: 'Bao Lô 2 số', short: 'BL2', color: 'blue' },
  BAO_LO_3: { value: 'BAO_LO_3', label: 'Bao Lô 3 số', short: 'BL3', color: 'indigo' },
  BAO_LO_4: { value: 'BAO_LO_4', label: 'Bao Lô 4 số', short: 'BL4', color: 'purple' },
  BAO_DAO_2: { value: 'BAO_DAO_2', label: 'Bao Đảo 2 số', short: 'BĐ2', color: 'cyan' },
  BAO_DAO_3: { value: 'BAO_DAO_3', label: 'Bao Đảo 3 số', short: 'BĐ3', color: 'teal' },
  DAU: { value: 'DAU', label: 'Đầu', short: 'Đ', color: 'orange' },
  DUOI: { value: 'DUOI', label: 'Đuôi', short: 'ĐI', color: 'amber' },
  DA: { value: 'DA', label: 'Đá', short: 'ĐA', color: 'red' },
  DA_XIEN: { value: 'DA_XIEN', label: 'Đá Xiên', short: 'ĐX', color: 'rose' },
  DA_VONG: { value: 'DA_VONG', label: 'Đá Vòng', short: 'ĐV', color: 'pink' },
  XIEN_2: { value: 'XIEN_2', label: 'Xiên 2', short: 'X2', color: 'green' },
  XIEN_3: { value: 'XIEN_3', label: 'Xiên 3', short: 'X3', color: 'emerald' },
  XIEN_4: { value: 'XIEN_4', label: 'Xiên 4', short: 'X4', color: 'lime' },
  BAY_LO: { value: 'BAY_LO', label: '7 Lô MN', short: '7L', color: 'sky' },
  TAM_LO: { value: 'TAM_LO', label: '8 Lô HN', short: '8L', color: 'violet' }
};

// Bảng hệ số THU (từ ảnh thực tế)
export const BANG_HE_SO_THU = {
  BL2: { '1D': 14.4, '2D': 28.8, 'HN': 21.6, 'BC': 74 },
  BL3: { '1D': 13.6, '2D': 27.2, 'HN': 18.4 },
  BL4: { '1D': 12.8, '2D': 25.6, 'HN': 16 },
  DAU: { '1D': 0.8, '2D': 1.6, 'HN': 3.2 },
  DUOI: { '1D': 0.8, '2D': 1.6, 'HN': 0.8 },
  DA: { '1D': 28.8, '2D': 57.6, 'HN': 43.2 },
  DA_XIEN: { '1D': 36, 'HN': 54 },
  XIEN: { '1D': 1.6, '2D': 3.2, 'HN': 3.2 },
  '7LO': { '1D': 5.6, '2D': 11.2 },
  '8LO': { 'HN': 6.4 }
};

// Bảng THƯỞNG (từ ảnh thực tế - đơn vị K = 1000đ)
export const BANG_THUONG = {
  'BL2_DD': { label: 'Bao lô 2 số + Đầu Đuôi chung', tien: 74, unit: 'K' },
  '7LO_MN': { label: '7 lô miền nam', tien: 74, unit: 'K' },
  '8LO_HN': { label: '8 lô hà nội', tien: 74, unit: 'K' },
  'BL3_XIU': { label: 'Bao lô 3 số + Xỉu chủ chung', tien: 640, unit: 'K' },
  'DA_1DAI_MN_MT': { label: 'Đá 1 đài MN + MT chung', tien: 730, unit: 'K' },
  'DA_1DAI_XIEN': { label: 'Đá 1 đài MN xiên + MT xiên', tien: 750, unit: 'K' },
  'DA_2DAI': { label: 'Đá 2 đài MN + MT chung', tien: 540, unit: 'K' },
  'DA_HN': { label: 'Đá HN chung', tien: 640, unit: 'K' },
  'DA_HN_XIEN': { label: 'Đá HN xiên chung', tien: 700, unit: 'K' },
  'BL4': { label: 'Bao lô 4 số chung', tien: 5300, unit: 'K' }
};

// Lịch xổ số theo ngày
export const LICH_XO_SO = {
  'THU_2': {
    MN: ['TP.HCM', 'ĐỒNG THÁP', 'CÀ MAU'],
    MT: ['PHÚ YÊN', 'HUẾ']
  },
  'THU_3': {
    MN: ['BẾN TRE', 'VŨNG TÀU', 'BẠC LIÊU'],
    MT: ['ĐẮK LẮK', 'QUẢNG NAM']
  },
  'THU_4': {
    MN: ['ĐỒNG NAI', 'CẦN THƠ', 'SÓC TRĂNG'],
    MT: ['ĐÀ NẴNG', 'KHÁNH HÒA', 'QUẢNG BÌNH']
  },
  'THU_5': {
    MN: ['TÂY NINH', 'AN GIANG', 'BÌNH THUẬN'],
    MT: ['BÌNH ĐỊNH', 'QUẢNG TRỊ']
  },
  'THU_6': {
    MN: ['VĨNH LONG', 'BÌNH DƯƠNG', 'TRÀ VINH'],
    MT: ['GIA LAI', 'NINH THUẬN']
  },
  'THU_7': {
    MN: ['TP.HCM', 'LONG AN', 'BÌNH PHƯỚC', 'HẬU GIANG'],
    MT: ['ĐÀ NẴNG', 'QUẢNG NGÃI', 'ĐẮK NÔNG']
  },
  'C_NHAT': {
    MN: ['TIỀN GIANG', 'KIÊN GIANG', 'ĐÀ LẠT'],
    MT: ['KON TUM', 'KHÁNH HÒA', 'HUẾ']
  }
};

// Format tiền VNĐ (làm tròn lên đến 1000đ)
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '0đ';
  // Làm tròn lên đến 1000đ
  const rounded = Math.ceil(amount / 1000) * 1000;
  return new Intl.NumberFormat('vi-VN').format(rounded) + 'đ';
}

// Format tiền ngắn gọn (làm tròn lên)
export function formatMoneyShort(amount) {
  // Làm tròn lên đến 1000đ
  const rounded = Math.ceil(amount / 1000) * 1000;
  if (rounded >= 1000000) {
    return (rounded / 1000000).toFixed(1) + 'tr';
  }
  if (rounded >= 1000) {
    return (rounded / 1000).toFixed(0) + 'K';
  }
  return rounded + 'đ';
}

// Format ngày
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Lấy ngày hôm nay format YYYY-MM-DD
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Lấy thứ trong tuần
export function getDayOfWeek(dateString) {
  const date = new Date(dateString);
  const days = ['C_NHAT', 'THU_2', 'THU_3', 'THU_4', 'THU_5', 'THU_6', 'THU_7'];
  return days[date.getDay()];
}

// Tính số đảo
export function tinhSoDao(number) {
  const str = number.toString();
  const uniqueDigits = new Set(str.split(''));
  const length = str.length;
  
  if (length === 2) {
    return uniqueDigits.size === 2 ? 2 : 1;
  }
  if (length === 3) {
    if (uniqueDigits.size === 3) return 6;
    if (uniqueDigits.size === 2) return 3;
    return 1;
  }
  if (length === 4) {
    if (uniqueDigits.size === 4) return 24;
    if (uniqueDigits.size === 3) return 12;
    if (uniqueDigits.size === 2) {
      const counts = {};
      str.split('').forEach(d => counts[d] = (counts[d] || 0) + 1);
      const values = Object.values(counts);
      if (values.filter(v => v === 2).length === 2) return 6;
      return 12;
    }
    return 1;
  }
  return 1;
}

// Tính số cặp đá
export function tinhSoCapDa(n) {
  if (n < 2) return 0;
  return (n * (n - 1)) / 2;
}
