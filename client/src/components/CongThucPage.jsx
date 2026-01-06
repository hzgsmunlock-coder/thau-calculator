/**
 * ================================================================
 * CÔNG THỨC PAGE - Hiển thị bảng giá và công thức tính
 * ================================================================
 */

import { BANG_HE_SO_THU, BANG_THUONG, LICH_XO_SO, getDayOfWeek, getTodayString } from '../utils/constants';

function CongThucPage() {
  const today = getTodayString();
  const dayOfWeek = getDayOfWeek(today);
  const lichHomNay = LICH_XO_SO[dayOfWeek];

  const dayLabels = {
    'C_NHAT': 'Chủ Nhật',
    'THU_2': 'Thứ 2',
    'THU_3': 'Thứ 3',
    'THU_4': 'Thứ 4',
    'THU_5': 'Thứ 5',
    'THU_6': 'Thứ 6',
    'THU_7': 'Thứ 7'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          📖 CÔNG THỨC & BẢNG GIÁ 2024
        </h1>
        <p className="text-white/80 mt-1">
          Bảng hệ số thu và thưởng cập nhật mới nhất
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bảng hệ số THU */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h2 className="text-lg font-bold">💰 BẢNG HỆ SỐ THU</h2>
            <p className="text-sm text-blue-100">Tiền thu = Điểm × Hệ số</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-3 font-semibold">Kiểu chơi</th>
                  <th className="text-center py-2 px-3 font-semibold">1 Đài</th>
                  <th className="text-center py-2 px-3 font-semibold">2 Đài</th>
                  <th className="text-center py-2 px-3 font-semibold">HN</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Bao Lô 2 số</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL2['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL2['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL2['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Bao Lô 3 số</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL3['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL3['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL3['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Bao Lô 4 số</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL4['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL4['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.BL4['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Đầu</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DAU['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DAU['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DAU['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Đuôi</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DUOI['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DUOI['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DUOI['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Đá</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DA['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DA['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.DA['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">Xiên</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.XIEN['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.XIEN['2D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU.XIEN['HN']}</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">7 Lô MN</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU['7LO']['1D']}</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU['7LO']['2D']}</td>
                  <td className="text-center py-2 px-3 text-gray-400">-</td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="py-2 px-3 font-medium">8 Lô HN</td>
                  <td className="text-center py-2 px-3 text-gray-400">-</td>
                  <td className="text-center py-2 px-3 text-gray-400">-</td>
                  <td className="text-center py-2 px-3">{BANG_HE_SO_THU['8LO']['HN']}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bảng THƯỞNG */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-4">
            <h2 className="text-lg font-bold">🎁 BẢNG THƯỞNG 2024</h2>
            <p className="text-sm text-green-100">Tiền thưởng / điểm / 1 lần về</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {Object.entries(BANG_THUONG).map(([key, value]) => (
                <div 
                  key={key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <span className="text-sm">{value.label}</span>
                  <span className="font-bold text-green-600 text-lg">
                    {value.tien.toLocaleString()}{value.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Công thức tính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Công thức THU */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
            💰 CÔNG THỨC TÍNH THU
          </h3>
          <div className="space-y-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Bao thường:</p>
              <code className="text-blue-700">Tiền = Số × Điểm × Hệ số</code>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Bao đảo:</p>
              <code className="text-blue-700">Tiền = Điểm × Số đảo × Hệ số</code>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Đá vòng:</p>
              <code className="text-blue-700">Tiền = Điểm × Số cặp × Hệ số</code>
            </div>
          </div>
        </div>

        {/* Công thức TRẢ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
            🎁 CÔNG THỨC TÍNH TRẢ
          </h3>
          <div className="space-y-4 text-sm">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Khi trúng:</p>
              <code className="text-green-700">Tiền = Điểm × Thưởng × Số lần về</code>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-semibold mb-1">Ví dụ BL2:</p>
              <code className="text-green-700">10đ × 74K × 2 lần = 1.480K</code>
            </div>
          </div>
        </div>

        {/* Số đảo */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            🔄 BẢNG SỐ ĐẢO
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-purple-50 rounded">
              <span>3 số khác nhau (123)</span>
              <span className="font-bold">6 đảo</span>
            </div>
            <div className="flex justify-between p-2 bg-purple-50 rounded">
              <span>2 số giống (112)</span>
              <span className="font-bold">3 đảo</span>
            </div>
            <div className="flex justify-between p-2 bg-purple-50 rounded">
              <span>3 số giống (111)</span>
              <span className="font-bold">1 đảo</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between p-2 bg-purple-50 rounded">
              <span>4 số khác nhau</span>
              <span className="font-bold">24 đảo</span>
            </div>
            <div className="flex justify-between p-2 bg-purple-50 rounded">
              <span>2 cặp giống (1122)</span>
              <span className="font-bold">6 đảo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Đá vòng */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          🎯 BẢNG ĐÁ VÒNG
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">3 số</div>
            <div className="text-sm text-gray-600">3 cặp = 3V</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">4 số</div>
            <div className="text-sm text-gray-600">6 cặp = 6V</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">5 số</div>
            <div className="text-sm text-gray-600">10 cặp = 10V</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">6 số</div>
            <div className="text-sm text-gray-600">15 cặp = 15V</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">7 số</div>
            <div className="text-sm text-gray-600">21 cặp = 21V</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Công thức: Số cặp = n × (n-1) / 2
        </p>
      </div>

      {/* Lịch xổ số */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-500 text-white px-6 py-4">
          <h2 className="text-lg font-bold">📅 LỊCH XỔ SỐ HÀNG TUẦN</h2>
          <p className="text-sm text-orange-100">
            Hôm nay: {dayLabels[dayOfWeek]}
          </p>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3">Thứ</th>
                <th className="text-left py-2 px-3">Miền Nam (3 đài)</th>
                <th className="text-left py-2 px-3">Miền Trung (2-3 đài)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(LICH_XO_SO).map(([day, lich]) => (
                <tr 
                  key={day} 
                  className={day === dayOfWeek ? 'bg-orange-50 font-medium' : 'hover:bg-gray-50'}
                >
                  <td className="py-2 px-3">
                    {day === dayOfWeek && <span className="mr-1">👉</span>}
                    {dayLabels[day]}
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {lich.MN?.join(', ')}
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {lich.MT?.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CongThucPage;
