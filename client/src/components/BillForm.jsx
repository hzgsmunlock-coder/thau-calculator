/**
 * ================================================================
 * BILL FORM - Form nhập bill theo dạng cấu trúc (Enhanced)
 * ================================================================
 */

import { useState } from 'react';
import { LOAI_DAI, KIEU_CHOI } from '../utils/constants';

function BillForm({ onCalculate, loading }) {
  const [lines, setLines] = useState([
    { id: 1, numbers: '', diem: 1, kieuChoi: 'BAO_LO_2', loaiDai: 'MOT_DAI' }
  ]);

  // Thêm dòng mới
  const addLine = () => {
    setLines([
      ...lines,
      { 
        id: Date.now(), 
        numbers: '', 
        diem: 1, 
        kieuChoi: 'BAO_LO_2', 
        loaiDai: 'MOT_DAI' 
      }
    ]);
  };

  // Xóa dòng
  const removeLine = (id) => {
    if (lines.length === 1) return;
    setLines(lines.filter(line => line.id !== id));
  };

  // Cập nhật dòng
  const updateLine = (id, field, value) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  // Duplicate dòng
  const duplicateLine = (line) => {
    setLines([
      ...lines,
      { ...line, id: Date.now(), numbers: '' }
    ]);
  };

  // Clear all
  const clearAll = () => {
    setLines([{ id: 1, numbers: '', diem: 1, kieuChoi: 'BAO_LO_2', loaiDai: 'MOT_DAI' }]);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Chuyển đổi sang format cho API
    const billLines = lines
      .filter(line => line.numbers.trim())
      .map(line => ({
        numbers: line.numbers.split(/[\s,]+/).filter(n => n.match(/^\d{2,4}$/)),
        diem: parseFloat(line.diem) || 1,
        kieuChoi: line.kieuChoi,
        loaiDai: line.loaiDai
      }))
      .filter(line => line.numbers.length > 0);
    
    if (billLines.length === 0) {
      alert('Vui lòng nhập ít nhất 1 số hợp lệ');
      return;
    }
    
    onCalculate(billLines);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-700">📋 Nhập theo dạng form</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            🗑️ Xóa hết
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {lines.map((line, index) => (
          <div 
            key={line.id} 
            className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-blue-600">
                Dòng {index + 1}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => duplicateLine(line)}
                  className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 bg-blue-50 rounded"
                  title="Nhân đôi dòng này"
                >
                  📋 Copy
                </button>
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 rounded"
                  >
                    ✕ Xóa
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Số đánh */}
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs text-gray-500 mb-1">
                  Số đánh (cách bởi dấu cách hoặc phẩy)
                </label>
                <input
                  type="text"
                  value={line.numbers}
                  onChange={(e) => updateLine(line.id, 'numbers', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="VD: 23 45 67 hoặc 23,45,67"
                />
              </div>

              {/* Kiểu chơi */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Kiểu chơi
                </label>
                <select
                  value={line.kieuChoi}
                  onChange={(e) => updateLine(line.id, 'kieuChoi', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(KIEU_CHOI).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Loại đài */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Loại đài
                </label>
                <select
                  value={line.loaiDai}
                  onChange={(e) => updateLine(line.id, 'loaiDai', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(LOAI_DAI).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Điểm */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Điểm
                </label>
                <input
                  type="number"
                  value={line.diem}
                  onChange={(e) => updateLine(line.id, 'diem', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add line button */}
      <button
        type="button"
        onClick={addLine}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
      >
        ➕ Thêm dòng mới
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
      >
        {loading ? '⏳ Đang tính...' : '🧮 TÍNH BILL'}
      </button>
    </form>
  );
}

export default BillForm;
