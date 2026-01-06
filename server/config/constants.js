/**
 * ================================================================
 * HỆ SỐ THU VÀ THƯỞNG CHO THẦU LÔ ĐỀ - BẢNG GIÁ 2024
 * ================================================================
 * 
 * Cập nhật theo bảng giá thực tế từ quầy thầu
 * 
 * QUAN TRỌNG: Đây là logic từ góc độ THẦU (người làm thầu)
 * - THU: Tiền thầu thu vào từ khách đánh
 * - TRẢ: Tiền thầu phải trả khi khách trúng
 */

// ================================================================
// BẢNG HỆ SỐ THU (tiền thầu thu từ khách khi nhận bill)
// Đơn vị: hệ số nhân với điểm
// ================================================================

/**
 * Hệ số thu cho Bao Lô 2 số (BL2)
 */
export const HE_SO_THU_BL2 = {
  MOT_DAI: 14.4,
  HAI_DAI: 28.8,
  HA_NOI: 21.6,
  BAO_CHUNG: 74
};

/**
 * Hệ số thu cho Bao Lô 3 số (BL3)
 */
export const HE_SO_THU_BL3 = {
  MOT_DAI: 13.6,
  HAI_DAI: 27.2,
  HA_NOI: 18.4
};

/**
 * Hệ số thu cho Bao Lô 4 số (BL4)
 */
export const HE_SO_THU_BL4 = {
  MOT_DAI: 12.8,
  HAI_DAI: 25.6,
  HA_NOI: 16
};

/**
 * Hệ số thu cho ĐẦU
 */
export const HE_SO_THU_DAU = {
  MOT_DAI: 0.8,
  HAI_DAI: 1.6,
  HA_NOI: 3.2
};

/**
 * Hệ số thu cho ĐUÔI
 */
export const HE_SO_THU_DUOI = {
  MOT_DAI: 0.8,
  HAI_DAI: 1.6,
  HA_NOI: 0.8
};

/**
 * Hệ số thu cho 7 Lô (MN)
 */
export const HE_SO_THU_7LO = {
  MOT_DAI: 5.6,
  HAI_DAI: 11.2
};

/**
 * Hệ số thu cho 8 Lô (HN)
 */
export const HE_SO_THU_8LO = {
  HA_NOI: 6.4
};

/**
 * Hệ số thu cho ĐÁ
 */
export const HE_SO_THU_DA = {
  MOT_DAI: 28.8,
  HAI_DAI: 57.6,
  HA_NOI: 43.2,
  DA_XIEN: 36,
  DA_N_KI: 54
};

/**
 * Hệ số thu cho XIÊN
 */
export const HE_SO_THU_XIEN = {
  MOT_DAI: 1.6,
  HAI_DAI: 3.2,
  HA_NOI: 3.2
};

// ================================================================
// BẢNG THƯỞNG (tiền thầu phải trả khi khách trúng)
// Đơn vị: VNĐ / điểm / 1 lần về
// ================================================================

export const THUONG = {
  BAO_LO_2_SO: 74000,
  BAO_LO_3_SO: 640000,
  BAO_LO_4_SO: 5300000,
  
  DAU_DUOI: 74000,
  BAY_LO: 74000,
  TAM_LO: 74000,
  
  DA_1_DAI_MN_MT: 730000,
  DA_1_DAI_XIEN: 750000,
  DA_2_DAI: 540000,
  DA_HN: 640000,
  DA_HN_XIEN: 700000,
  
  XIEN_2: 640000,
  XIEN_3: 5300000,
  XIEN_4: 40000000
};

// ================================================================
// LOẠI ĐÀI VÀ KIỂU CHƠI
// ================================================================

export const LOAI_DAI = {
  MOT_DAI: 'MOT_DAI',
  HAI_DAI: 'HAI_DAI',
  HA_NOI: 'HA_NOI',
  BAO_CHUNG: 'BAO_CHUNG'
};

export const KIEU_CHOI = {
  BAO_LO_2: 'BAO_LO_2',
  BAO_LO_3: 'BAO_LO_3',
  BAO_LO_4: 'BAO_LO_4',
  BAO_DAO_2: 'BAO_DAO_2',
  BAO_DAO_3: 'BAO_DAO_3',
  DAU: 'DAU',
  DUOI: 'DUOI',
  DA: 'DA',
  DA_XIEN: 'DA_XIEN',
  DA_VONG: 'DA_VONG',
  XIEN_2: 'XIEN_2',
  XIEN_3: 'XIEN_3',
  XIEN_4: 'XIEN_4',
  BAY_LO: 'BAY_LO',
  TAM_LO: 'TAM_LO',
  XIU_CHU: 'XIU_CHU'
};

// ================================================================
// LỊCH XỔ SỐ THEO NGÀY
// ================================================================

export const LICH_XO_SO = {
  MIEN_NAM: {
    'THU_2': ['TP.HCM', 'ĐỒNG THÁP', 'CÀ MAU'],
    'THU_3': ['BẾN TRE', 'VŨNG TÀU', 'BẠC LIÊU'],
    'THU_4': ['ĐỒNG NAI', 'CẦN THƠ', 'SÓC TRĂNG'],
    'THU_5': ['TÂY NINH', 'AN GIANG', 'BÌNH THUẬN'],
    'THU_6': ['VĨNH LONG', 'BÌNH DƯƠNG', 'TRÀ VINH'],
    'THU_7': ['TP.HCM', 'LONG AN', 'BÌNH PHƯỚC', 'HẬU GIANG'],
    'C_NHAT': ['TIỀN GIANG', 'KIÊN GIANG', 'ĐÀ LẠT']
  },
  MIEN_TRUNG: {
    'THU_2': ['PHÚ YÊN', 'HUẾ'],
    'THU_3': ['ĐẮK LẮK', 'QUẢNG NAM'],
    'THU_4': ['ĐÀ NẴNG', 'KHÁNH HÒA', 'QUẢNG BÌNH'],
    'THU_5': ['BÌNH ĐỊNH', 'QUẢNG TRỊ'],
    'THU_6': ['GIA LAI', 'NINH THUẬN'],
    'THU_7': ['ĐÀ NẴNG', 'QUẢNG NGÃI', 'ĐẮK NÔNG'],
    'C_NHAT': ['KON TUM', 'KHÁNH HÒA', 'HUẾ']
  }
};

// ================================================================
// HÀM TÍNH SỐ ĐẢO
// ================================================================

export function tinhSoDao(number) {
  const str = number.toString();
  const digits = str.split('');
  const uniqueDigits = new Set(digits);
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
      digits.forEach(d => counts[d] = (counts[d] || 0) + 1);
      const values = Object.values(counts);
      if (values.includes(2) && values.filter(v => v === 2).length === 2) return 6;
      return 12;
    }
    return 1;
  }
  
  return 1;
}

export function taoSoDao(number) {
  const str = number.toString();
  const digits = str.split('');
  const permutations = new Set();
  
  function permute(arr, start = 0) {
    if (start === arr.length - 1) {
      permutations.add(arr.join(''));
      return;
    }
    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute([...arr], start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  }
  
  permute(digits);
  return Array.from(permutations);
}

// ================================================================
// HÀM TÍNH SỐ CẶP ĐÁ VÒNG
// ================================================================

export function tinhSoCapDa(numbers) {
  const n = numbers.length;
  if (n < 2) return 0;
  return (n * (n - 1)) / 2;
}

export function taoCapDa(numbers) {
  const pairs = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      pairs.push([numbers[i], numbers[j]]);
    }
  }
  return pairs;
}

// ================================================================
// HÀM LẤY HỆ SỐ THU
// ================================================================

export function layHeSoThu(kieuChoi, loaiDai) {
  switch (kieuChoi) {
    case KIEU_CHOI.BAO_LO_2:
    case KIEU_CHOI.BAO_DAO_2:
      return HE_SO_THU_BL2[loaiDai] || HE_SO_THU_BL2.MOT_DAI;
    
    case KIEU_CHOI.BAO_LO_3:
    case KIEU_CHOI.BAO_DAO_3:
      return HE_SO_THU_BL3[loaiDai] || HE_SO_THU_BL3.MOT_DAI;
    
    case KIEU_CHOI.BAO_LO_4:
      return HE_SO_THU_BL4[loaiDai] || HE_SO_THU_BL4.MOT_DAI;
    
    case KIEU_CHOI.DAU:
      return HE_SO_THU_DAU[loaiDai] || HE_SO_THU_DAU.MOT_DAI;
    
    case KIEU_CHOI.DUOI:
      return HE_SO_THU_DUOI[loaiDai] || HE_SO_THU_DUOI.MOT_DAI;
    
    case KIEU_CHOI.DA:
    case KIEU_CHOI.DA_VONG:
      return HE_SO_THU_DA[loaiDai] || HE_SO_THU_DA.MOT_DAI;
    
    case KIEU_CHOI.DA_XIEN:
      return HE_SO_THU_DA.DA_XIEN;
    
    case KIEU_CHOI.XIEN_2:
    case KIEU_CHOI.XIEN_3:
    case KIEU_CHOI.XIEN_4:
      return HE_SO_THU_XIEN[loaiDai] || HE_SO_THU_XIEN.MOT_DAI;
    
    case KIEU_CHOI.BAY_LO:
      return HE_SO_THU_7LO[loaiDai] || HE_SO_THU_7LO.MOT_DAI;
    
    case KIEU_CHOI.TAM_LO:
      return HE_SO_THU_8LO.HA_NOI;
    
    default:
      return HE_SO_THU_BL2.MOT_DAI;
  }
}

export function layTienThuong(kieuChoi, loaiDai = null, isXien = false) {
  switch (kieuChoi) {
    case KIEU_CHOI.BAO_LO_2:
    case KIEU_CHOI.BAO_DAO_2:
    case KIEU_CHOI.DAU:
    case KIEU_CHOI.DUOI:
    case KIEU_CHOI.BAY_LO:
    case KIEU_CHOI.TAM_LO:
      return THUONG.BAO_LO_2_SO;
    
    case KIEU_CHOI.BAO_LO_3:
    case KIEU_CHOI.BAO_DAO_3:
      return THUONG.BAO_LO_3_SO;
    
    case KIEU_CHOI.BAO_LO_4:
      return THUONG.BAO_LO_4_SO;
    
    case KIEU_CHOI.DA:
    case KIEU_CHOI.DA_VONG:
      if (loaiDai === LOAI_DAI.HA_NOI) {
        return isXien ? THUONG.DA_HN_XIEN : THUONG.DA_HN;
      }
      if (loaiDai === LOAI_DAI.HAI_DAI) {
        return THUONG.DA_2_DAI;
      }
      return isXien ? THUONG.DA_1_DAI_XIEN : THUONG.DA_1_DAI_MN_MT;
    
    case KIEU_CHOI.DA_XIEN:
      return loaiDai === LOAI_DAI.HA_NOI ? THUONG.DA_HN_XIEN : THUONG.DA_1_DAI_XIEN;
    
    case KIEU_CHOI.XIEN_2:
      return THUONG.XIEN_2;
    
    case KIEU_CHOI.XIEN_3:
      return THUONG.XIEN_3;
    
    case KIEU_CHOI.XIEN_4:
      return THUONG.XIEN_4;
    
    default:
      return THUONG.BAO_LO_2_SO;
  }
}

export default {
  HE_SO_THU_BL2,
  HE_SO_THU_BL3,
  HE_SO_THU_BL4,
  HE_SO_THU_DAU,
  HE_SO_THU_DUOI,
  HE_SO_THU_DA,
  HE_SO_THU_XIEN,
  HE_SO_THU_7LO,
  HE_SO_THU_8LO,
  THUONG,
  LOAI_DAI,
  KIEU_CHOI,
  LICH_XO_SO,
  tinhSoDao,
  taoSoDao,
  tinhSoCapDa,
  taoCapDa,
  layHeSoThu,
  layTienThuong
};
