/**
 * ================================================================
 * TÍNH TIỀN KHÁCH PAGE - Công cụ tính tiền thắng cho khách
 * ================================================================
 */

import { useState } from 'react';
import { BANG_THUONG, BANG_HE_SO_THU } from '../utils/constants';

function TinhTienKhachPage() {
  const [kieuChoi, setKieuChoi] = useState('BL2');
  const [loaiDai, setLoaiDai] = useState('1D');
  const [diem, setDiem] = useState('');
  const [soLanVe, setSoLanVe] = useState('1');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Mapping for display
  const kieuChoiOptions = [
    { value: 'BL2', label: 'Bao Lô 2 số' },
    { value: 'BL3', label: 'Bao Lô 3 số' },
    { value: 'BL4', label: 'Bao Lô 4 số' },
    { value: 'DAU', label: 'Đầu' },
    { value: 'DUOI', label: 'Đuôi' },
    { value: 'DA_1D', label: 'Đá 1 đài MN/MT' },
    { value: 'DA_XIEN', label: 'Đá 1 đài xiên' },
    { value: 'DA_2D', label: 'Đá 2 đài' },
    { value: 'DA_HN', label: 'Đá HN' },
    { value: 'DA_HN_XIEN', label: 'Đá HN xiên' },
    { value: '7LO', label: '7 Lô MN/MT' },
    { value: '8LO', label: '8 Lô HN' },
    { value: 'XIEN_2', label: 'Xiên 2' },
    { value: 'XIEN_3', label: 'Xiên 3' },
    { value: 'XIEN_4', label: 'Xiên 4' },
  ];

  const loaiDaiOptions = [
    { value: '1D', label: '1 Đài' },
    { value: '2D', label: '2 Đài' },
    { value: 'HN', label: 'Hà Nội' },
  ];

  // Lấy giá thưởng theo kiểu chơi
  const getThuong = (kieuChoi, loaiDai) => {
    switch (kieuChoi) {
      case 'BL2':
      case 'DAU':
      case 'DUOI':
        return BANG_THUONG.BL2_DD.tien;
      case 'BL3':
        return BANG_THUONG.BL3.tien;
      case 'BL4':
        return BANG_THUONG.BL4.tien;
      case '7LO':
      case '8LO':
        return BANG_THUONG['7LO_8LO'].tien;
      case 'DA_1D':
        return BANG_THUONG.DA_1D.tien;
      case 'DA_XIEN':
        return BANG_THUONG.DA_XIEN.tien;
      case 'DA_2D':
        return BANG_THUONG.DA_2D.tien;
      case 'DA_HN':
        return BANG_THUONG.DA_HN.tien;
      case 'DA_HN_XIEN':
        return BANG_THUONG.DA_HN_XIEN.tien;
      case 'XIEN_2':
        return BANG_THUONG.XIEN_2.tien;
      case 'XIEN_3':
        return BANG_THUONG.XIEN_3.tien;
      case 'XIEN_4':
        return BANG_THUONG.XIEN_4.tien;
      default:
        return BANG_THUONG.BL2_DD.tien;
    }
  };

  // Lấy hệ số thu
  const getHeSoThu = (kieuChoi, loaiDai) => {
    let key = kieuChoi;
    if (kieuChoi.startsWith('DA')) {
      key = 'DA';
    }
    if (kieuChoi.startsWith('XIEN')) {
      key = 'XIEN';
    }
    
    const heSo = BANG_HE_SO_THU[key];
    if (!heSo) return 0;
    return heSo[loaiDai] || heSo['1D'] || 0;
  };

  const calculate = () => {
    const diemNum = parseFloat(diem) || 0;
    const soLanVeNum = parseInt(soLanVe) || 1;
    
    if (diemNum <= 0) {
      alert('Vui lòng nhập điểm đánh');
      return;
    }

    const thuong = getThuong(kieuChoi, loaiDai);
    const heSoThu = getHeSoThu(kieuChoi, loaiDai);
    
    // Tiền khách thắng = Điểm × Thưởng × Số lần về
    const tienThang = diemNum * thuong * soLanVeNum;
    
    // Tiền khách đã đóng = Điểm × Hệ số thu
    const tienDong = diemNum * heSoThu * 1000;
    
    // Lời thực của khách
    const loiRong = tienThang - tienDong;

    const kieuChoiLabel = kieuChoiOptions.find(k => k.value === kieuChoi)?.label || kieuChoi;
    const loaiDaiLabel = loaiDaiOptions.find(l => l.value === loaiDai)?.label || loaiDai;

    const newResult = {
      id: Date.now(),
      kieuChoi: kieuChoiLabel,
      loaiDai: loaiDaiLabel,
      diem: diemNum,
      soLanVe: soLanVeNum,
      thuong,
      heSoThu,
      tienDong,
      tienThang,
      loiRong,
      time: new Date().toLocaleTimeString('vi-VN')
    };

    setResult(newResult);
    setHistory(prev => [newResult, ...prev.slice(0, 9)]);
  };

  const clearAll = () => {
    setDiem('');
    setSoLanVe('1');
    setResult(null);
  };

  const formatMoney = (amount) => {
    // Làm tròn lên đến 1000đ
    const rounded = Math.ceil(amount / 1000) * 1000;
    if (rounded >= 1000000) {
      return (rounded / 1000000).toFixed(2) + ' triệu';
    }
    if (rounded >= 1000) {
      return (rounded / 1000).toFixed(0) + 'K';
    }
    return rounded.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header - Compact on mobile */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          🧮 TÍNH TIỀN THẮNG KHÁCH
        </h1>
        <p className="text-white/80 mt-1 text-xs sm:text-base">
          Công cụ tính nhanh tiền thắng khi khách trúng số
        </p>
      </div>

      {/* Kết quả nhanh - Show first on mobile if result exists */}
      {result && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
          {/* Lời ròng - Big display */}
          <div className={`rounded-xl p-4 text-center mb-4 ${
            result.loiRong >= 0 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="text-xs opacity-80">
              {result.loiRong >= 0 ? '🎉 KHÁCH LỜI RÒNG' : '📉 KHÁCH LỖ'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold">
              {result.loiRong >= 0 ? '+' : ''}{formatMoney(result.loiRong)}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg p-3 shadow text-center">
              <div className="text-xs text-gray-500">Kiểu chơi</div>
              <div className="text-sm font-bold">{result.kieuChoi}</div>
              <div className="text-xs text-gray-400">{result.loaiDai}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 shadow text-center">
              <div className="text-xs text-gray-500">Điểm × Lần về</div>
              <div className="text-sm font-bold">{result.diem}đ × {result.soLanVe}</div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 shadow text-center">
              <div className="text-xs text-blue-600">💰 Đã đóng</div>
              <div className="text-base font-bold text-blue-700">
                {formatMoney(result.tienDong)}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 shadow text-center">
              <div className="text-xs text-green-600">🎁 Thưởng nhận</div>
              <div className="text-base font-bold text-green-700">
                {formatMoney(result.tienThang)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form tính - Mobile optimized */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          📝 NHẬP THÔNG TIN
        </h2>
        
        <div className="space-y-4">
          {/* Kiểu chơi - Full width select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kiểu chơi
            </label>
            <select
              value={kieuChoi}
              onChange={(e) => setKieuChoi(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ fontSize: '16px' }}
            >
              {kieuChoiOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loại đài - Quick select buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đài
            </label>
            <div className="flex gap-2">
              {loaiDaiOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLoaiDai(opt.value)}
                  className={`flex-1 py-3 px-3 rounded-xl font-medium text-sm transition-all ${
                    loaiDai === opt.value
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Điểm & Số lần về - Side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điểm đánh
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={diem}
                onChange={(e) => setDiem(e.target.value)}
                placeholder="VD: 10"
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="0"
                step="0.1"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần về
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={soLanVe}
                onChange={(e) => setSoLanVe(e.target.value)}
                placeholder="VD: 1"
                className="w-full border border-gray-300 rounded-xl px-4 py-4 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="1"
                step="1"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Buttons - Large touch targets */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={calculate}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold active:from-green-600 active:to-emerald-700 transition-all shadow-lg text-lg"
            >
              🧮 TÍNH NGAY
            </button>
            <button
              onClick={clearAll}
              className="py-4 px-5 bg-gray-200 text-gray-700 rounded-xl font-semibold active:bg-gray-300 transition-all"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Bảng thưởng nhanh - Horizontal scroll on mobile */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
          📌 BẢNG THƯỞNG NHANH
        </h3>
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-2 min-w-max">
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">BL2/Đầu/Đuôi</div>
              <div className="font-bold text-green-600 text-sm">74K</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">BL3</div>
              <div className="font-bold text-green-600 text-sm">640K</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">BL4</div>
              <div className="font-bold text-green-600 text-sm">5.3M</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">Đá 1Đ</div>
              <div className="font-bold text-green-600 text-sm">730K</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">Đá HN</div>
              <div className="font-bold text-green-600 text-sm">640K</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center min-w-[80px]">
              <div className="text-xs text-gray-500">Xiên 2</div>
              <div className="font-bold text-green-600 text-sm">15K</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử - Collapsible on mobile */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
            📜 LỊCH SỬ TÍNH
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-gray-50 rounded-lg text-sm active:bg-gray-100 cursor-pointer"
                onClick={() => setResult(item)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-xs">{item.kieuChoi}</span>
                    <span className="text-gray-400 text-xs ml-1">{item.loaiDai}</span>
                    <span className="text-gray-500 text-xs ml-2">{item.diem}đ×{item.soLanVe}</span>
                  </div>
                  <span className={`font-bold text-sm ${item.loiRong >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.loiRong >= 0 ? '+' : ''}{formatMoney(item.loiRong)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TinhTienKhachPage;
