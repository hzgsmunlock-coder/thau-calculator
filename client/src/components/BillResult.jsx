/**
 * ================================================================
 * BILL RESULT - Hiển thị kết quả tính toán (Enhanced)
 * ================================================================
 */

import { KIEU_CHOI, LOAI_DAI, formatMoney } from '../utils/constants';

function BillResult({ result, onSave, loading }) {
  const { tongThu, tongThuFormatted, chiTiet } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-700">📊 Chi tiết tính toán</h3>
        <span className="text-sm text-gray-500">{chiTiet?.length || 0} dòng</span>
      </div>

      {/* Chi tiết từng dòng */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {chiTiet?.map((dong, index) => (
          <div 
            key={index}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {dong.dong}
                </span>
                <span className="font-medium text-gray-800">
                  {KIEU_CHOI[dong.kieuChoi]?.label || dong.kieuChoi}
                </span>
              </div>
              <span className="text-lg font-bold text-green-600">
                +{formatMoney(dong.tienThu)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              {/* Số đánh */}
              <div className="flex flex-wrap gap-1">
                {dong.numbers?.map((num, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono text-xs"
                  >
                    {num}
                  </span>
                ))}
              </div>
              
              {/* Info row */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  {LOAI_DAI[dong.loaiDai]?.label || dong.loaiDai}
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  {dong.diem}đ
                </span>
                {dong.soCap > 1 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                    {dong.soCap} cặp
                  </span>
                )}
              </div>

              {/* Công thức */}
              <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                {dong.congThuc}
              </div>
              
              {/* Chi tiết đảo nếu có */}
              {dong.chiTietDao?.length > 0 && (
                <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  Đảo: {dong.chiTietDao.map((d, i) => (
                    <span key={i} className="mr-2 font-mono">
                      {d.so}→{d.soDao}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">💰 TỔNG TIỀN THU</p>
            <p className="text-3xl font-bold">{tongThuFormatted}</p>
          </div>
          <div className="text-5xl opacity-50">💵</div>
        </div>
        <p className="text-sm opacity-75 mt-3 border-t border-white/20 pt-3">
          Số tiền thầu thu từ khách khi đánh bill này
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? '⏳ Đang lưu...' : '💾 LƯU BILL'}
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
        >
          🖨️ In
        </button>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
        <p className="text-yellow-700">
          <strong>💡 Mẹo:</strong> Lưu bill để theo dõi sau khi có kết quả xổ số. 
          Vào tab "Kết quả" để nhập KQXS và tự động tính tiền trả.
        </p>
      </div>
    </div>
  );
}

export default BillResult;
