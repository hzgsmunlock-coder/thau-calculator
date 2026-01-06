/**
 * ================================================================
 * KET QUA PAGE - Trang nhập và xử lý kết quả xổ số
 * ================================================================
 */

import { useState, useEffect } from 'react';
import { ketQuaApi, billApi } from '../services/api';
import { formatMoney, getTodayString, formatDate, LICH_XO_SO, getDayOfWeek } from '../utils/constants';

function KetQuaPage() {
  const [ngay, setNgay] = useState(getTodayString());
  const [ketQuaText, setKetQuaText] = useState('');
  const [parsedKetQua, setParsedKetQua] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [miền, setMien] = useState('MB');

  // Get lịch xổ số cho ngày được chọn
  const dayOfWeek = getDayOfWeek(ngay);
  const dayLabels = {
    'C_NHAT': 'Chủ Nhật',
    'THU_2': 'Thứ 2',
    'THU_3': 'Thứ 3',
    'THU_4': 'Thứ 4',
    'THU_5': 'Thứ 5',
    'THU_6': 'Thứ 6',
    'THU_7': 'Thứ 7'
  };
  const lichNgay = LICH_XO_SO[dayOfWeek];

  // Parse kết quả từ text
  const handleParseKetQua = async () => {
    if (!ketQuaText.trim()) {
      setError('Vui lòng nhập kết quả xổ số');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ketQuaApi.parse(ketQuaText, ngay, miền);
      setParsedKetQua(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Parse kết quả thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng kết quả cho các bills
  const handleApplyKetQua = async () => {
    if (!parsedKetQua) {
      setError('Chưa có kết quả để áp dụng');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ketQuaApi.apply(ngay, {
        lo2so: parsedKetQua.lo2so,
        lo3so: parsedKetQua.lo3so,
        dau: parsedKetQua.dau,
        duoi: parsedKetQua.duoi
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Áp dụng kết quả thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setKetQuaText('');
    setParsedKetQua(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🎰 NHẬP KẾT QUẢ XỔ SỐ
        </h1>
        <p className="text-white/80 mt-1">
          Nhập kết quả để tính lời/lỗ cho thầu
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form nhập kết quả */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📝 NHẬP KẾT QUẢ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Ngày xổ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Ngày xổ
              </label>
              <input
                type="date"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {dayLabels[dayOfWeek]}
              </p>
            </div>

            {/* Miền */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗺️ Miền
              </label>
              <select
                value={miền}
                onChange={(e) => setMien(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              >
                <option value="MB">Miền Bắc (Hà Nội)</option>
                <option value="MN">Miền Nam</option>
                <option value="MT">Miền Trung</option>
              </select>
            </div>
          </div>

          {/* Lịch xổ số ngày đó */}
          {lichNgay && (
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-purple-700 mb-2">📅 Lịch xổ số:</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-purple-100 px-2 py-1 rounded">MN: {lichNgay.MN?.join(', ')}</span>
                <span className="bg-purple-100 px-2 py-1 rounded">MT: {lichNgay.MT?.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Text input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kết quả xổ số
            </label>
            <textarea
              value={ketQuaText}
              onChange={(e) => setKetQuaText(e.target.value)}
              className="w-full h-56 border border-gray-300 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder={`Nhập kết quả xổ số (mỗi dòng một giải):

ĐB: 12345
G1: 67890
G2: 12345 67890
...

Hoặc:
Lô 2 số: 23, 45, 67, 89
Lô 3 số: 123, 456

Hoặc copy/paste từ kết quả xổ số online`}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleParseKetQua}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? '⏳ Đang xử lý...' : '📊 XỬ LÝ KẾT QUẢ'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Sidebar - Parsed result */}
        <div className="space-y-6">
          {/* Kết quả parse */}
          {parsedKetQua && (
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h3 className="font-bold text-gray-700 mb-3">🎯 Kết quả đã phân tích</h3>
              
              <div className="space-y-3 text-sm">
                {/* Lô 2 số */}
                {parsedKetQua.lo2so?.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-600 mb-1">Lô 2 số ({parsedKetQua.lo2so.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {parsedKetQua.lo2so.slice(0, 20).map((so, i) => (
                        <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">
                          {so}
                        </span>
                      ))}
                      {parsedKetQua.lo2so.length > 20 && (
                        <span className="text-gray-400">+{parsedKetQua.lo2so.length - 20} số khác</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Lô 3 số */}
                {parsedKetQua.lo3so?.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-600 mb-1">Lô 3 số ({parsedKetQua.lo3so.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {parsedKetQua.lo3so.slice(0, 15).map((so, i) => (
                        <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono">
                          {so}
                        </span>
                      ))}
                      {parsedKetQua.lo3so.length > 15 && (
                        <span className="text-gray-400">+{parsedKetQua.lo3so.length - 15}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Đầu */}
                {parsedKetQua.dau && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-600 mb-1">Đầu:</p>
                    <div className="grid grid-cols-5 gap-1">
                      {Object.entries(parsedKetQua.dau).map(([num, count]) => (
                        count > 0 && (
                          <span key={num} className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs text-center">
                            {num}: {count}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apply button */}
              <button
                onClick={handleApplyKetQua}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? '⏳ Đang tính...' : '✅ ÁP DỤNG VÀ TÍNH TIỀN'}
              </button>
            </div>
          )}

          {/* Hướng dẫn */}
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="font-bold text-gray-700 mb-3">💡 Hướng dẫn</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Nhập kết quả xổ số theo định dạng tiêu chuẩn</li>
              <li>• Hệ thống sẽ tự động phân tích lô 2 số, 3 số</li>
              <li>• Click "Áp dụng" để tính lời/lỗ cho các bills đã nhập</li>
              <li>• Kết quả sẽ được lưu lại để thống kê</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kết quả tính toán */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📊 KẾT QUẢ TÍNH TOÁN
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Tổng thu */}
            <div className="bg-blue-50 rounded-xl p-5 text-center">
              <div className="text-sm text-blue-600 mb-1">💰 TỔNG THU</div>
              <div className="text-2xl font-bold text-blue-700">
                {formatMoney(result.tongThu || 0)}
              </div>
            </div>

            {/* Tổng trả */}
            <div className="bg-red-50 rounded-xl p-5 text-center">
              <div className="text-sm text-red-600 mb-1">💸 TỔNG TRẢ</div>
              <div className="text-2xl font-bold text-red-700">
                {formatMoney(result.tongTra || 0)}
              </div>
            </div>

            {/* Lời/Lỗ */}
            <div className={`rounded-xl p-5 text-center ${
              (result.loiLo || 0) >= 0 
                ? 'bg-green-50' 
                : 'bg-red-50'
            }`}>
              <div className={`text-sm mb-1 ${
                (result.loiLo || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(result.loiLo || 0) >= 0 ? '📈 THẦU LỜI' : '📉 THẦU LỖ'}
              </div>
              <div className={`text-2xl font-bold ${
                (result.loiLo || 0) >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {(result.loiLo || 0) >= 0 ? '+' : ''}{formatMoney(result.loiLo || 0)}
              </div>
            </div>
          </div>

          {/* Chi tiết bills trúng */}
          {result.billsTrung?.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-3">🎯 Bills có trúng ({result.billsTrung.length}):</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {result.billsTrung.map((bill, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Bill #{bill.id}</span>
                      <span className="text-green-600 font-bold">{formatMoney(bill.tienTra)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Số trúng: {bill.soTrung?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KetQuaPage;
