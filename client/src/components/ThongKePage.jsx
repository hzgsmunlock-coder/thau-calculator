/**
 * ================================================================
 * THONG KE PAGE - Trang thống kê theo ngày (Enhanced)
 * ================================================================
 */

import { useState, useEffect } from 'react';
import { billApi } from '../services/api';
import { formatMoney, getTodayString, formatDate, KIEU_CHOI, LOAI_DAI } from '../utils/constants';

function ThongKePage() {
  const [ngay, setNgay] = useState(getTodayString());
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'

  // Load dữ liệu theo ngày
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await billApi.getByDate(ngay);
      setBills(data.bills || []);
      setStats(data.stats);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ngay]);

  // Xem chi tiết bill
  const viewBillDetail = async (billId) => {
    try {
      const data = await billApi.getById(billId);
      setSelectedBill(data);
    } catch (err) {
      alert('Không thể xem chi tiết bill');
    }
  };

  // Xóa bill
  const deleteBill = async (billId) => {
    if (!confirm('Bạn có chắc muốn xóa bill này?')) return;

    try {
      await billApi.delete(billId);
      loadData();
      alert('✅ Đã xóa bill thành công');
    } catch (err) {
      alert('❌ Xóa bill thất bại');
    }
  };

  // Quick date navigation
  const goToPrevDay = () => {
    const d = new Date(ngay);
    d.setDate(d.getDate() - 1);
    setNgay(d.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const d = new Date(ngay);
    d.setDate(d.getDate() + 1);
    setNgay(d.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setNgay(getTodayString());
  };

  // Calculate profit percentage
  const profitPercent = stats && stats.tong_thu > 0 
    ? ((stats.loi_lo / stats.tong_thu) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📊 THỐNG KÊ THẦU
        </h1>
        <p className="text-white/80 mt-1">
          Xem lại lịch sử và thống kê lời/lỗ
        </p>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevDay}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ◀
            </button>
            <input
              type="date"
              value={ngay}
              onChange={(e) => setNgay(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={goToNextDay}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ▶
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
            >
              Hôm nay
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 disabled:opacity-50"
          >
            {loading ? '⏳ Đang tải...' : '🔄 Làm mới'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">📋 Số Bill</p>
                <p className="text-2xl font-bold text-gray-800">{stats.so_bill || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📄
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">💰 Tổng Thu</p>
                <p className="text-xl font-bold text-blue-600">{formatMoney(stats.tong_thu || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                💵
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">💸 Tổng Trả</p>
                <p className="text-xl font-bold text-red-600">{formatMoney(stats.tong_tra || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                🎁
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-lg p-5 ${
            (stats.loi_lo || 0) >= 0 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}>
            <div>
              <p className="text-sm opacity-80 mb-1">
                {(stats.loi_lo || 0) >= 0 ? '📈 Thầu Lời' : '📉 Thầu Lỗ'}
              </p>
              <p className="text-2xl font-bold">
                {(stats.loi_lo || 0) >= 0 ? '+' : ''}{formatMoney(stats.loi_lo || 0)}
              </p>
              {stats.tong_thu > 0 && (
                <p className="text-xs opacity-80 mt-1">
                  {profitPercent}% trên tổng thu
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bills list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            📋 Danh sách Bills ({bills.length})
          </h2>
        </div>

        {bills.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p>Không có bill nào trong ngày {formatDate(ngay)}</p>
            <p className="text-sm mt-2">Chọn ngày khác hoặc tạo bill mới</p>
          </div>
        ) : (
          <div className="divide-y">
            {bills.map((bill) => (
              <div 
                key={bill.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">Bill #{bill.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        bill.trang_thai === 'CHUA_DOI' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : bill.trang_thai === 'DA_TRUNG'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {bill.trang_thai === 'CHUA_DOI' ? '⏳ Chờ dối' : 
                         bill.trang_thai === 'DA_TRUNG' ? '🎉 Đã trúng' : 
                         bill.trang_thai}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(bill.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {' • '}
                      {bill.so_dong || 0} dòng
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-bold text-blue-600">
                      {formatMoney(bill.tong_thu || 0)}
                    </p>
                    {bill.tong_tra > 0 && (
                      <p className="text-sm text-red-600">
                        Trả: {formatMoney(bill.tong_tra)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewBillDetail(bill.id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      👁
                    </button>
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Xóa bill"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill detail modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">📋 Chi tiết Bill #{selectedBill.id}</h3>
              <button
                onClick={() => setSelectedBill(null)}
                className="w-8 h-8 bg-white/20 rounded-full hover:bg-white/30 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {/* Tổng quan */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-blue-600">Tổng thu</p>
                  <p className="font-bold text-blue-700">{formatMoney(selectedBill.tong_thu)}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-red-600">Tổng trả</p>
                  <p className="font-bold text-red-700">{formatMoney(selectedBill.tong_tra || 0)}</p>
                </div>
              </div>

              {/* Chi tiết dòng */}
              {selectedBill.lines?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Chi tiết:</h4>
                  <div className="space-y-2">
                    {selectedBill.lines.map((line, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span className="font-mono">{line.numbers?.join(', ')}</span>
                          <span className="text-blue-600 font-medium">
                            {formatMoney(line.tienThu)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {KIEU_CHOI[line.kieuChoi]?.label || line.kieuChoi} • 
                          {LOAI_DAI[line.loaiDai]?.label || line.loaiDai} • 
                          {line.diem}đ
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedBill(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThongKePage;
