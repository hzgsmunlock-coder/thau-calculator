/**
 * ================================================================
 * BILL CALCULATOR - Component nhập và tính bill (Mobile-Optimized)
 * ================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { billApi } from '../services/api';
import { formatMoney, getTodayString, BANG_HE_SO_THU } from '../utils/constants';
import BillForm from './BillForm';
import BillResult from './BillResult';

function BillCalculator() {
  // State
  const [mode, setMode] = useState('text'); // 'text', 'form', 'image'
  const [billText, setBillText] = useState('');
  const [billLines, setBillLines] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [useLocalOCR, setUseLocalOCR] = useState(false); // Toggle AI vs Local OCR
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea on mobile
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + 'px';
    }
  }, [billText]);
  
  // Parse bill từ text
  const handleParseBill = async () => {
    if (!billText.trim()) {
      setError('Vui lòng nhập nội dung bill');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await billApi.parse(billText);
      setBillLines(data.bill);
      setResult({
        tongThu: data.tongThu,
        tongThuFormatted: data.tongThuFormatted,
        chiTiet: data.chiTiet
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Tính bill từ form
  const handleCalculateBill = async (lines) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await billApi.calculate(lines);
      setBillLines(lines);
      setResult({
        tongThu: data.thu.tong,
        tongThuFormatted: formatMoney(data.thu.tong),
        chiTiet: data.thu.chiTiet
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload hình ảnh - AI hoặc Local OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setImagePreview(base64Data);
      
      // Start OCR
      setLoading(true);
      setOcrStatus(useLocalOCR ? '📖 Đang đọc ảnh (Tesseract)...' : '🤖 Đang gửi ảnh cho AI...');
      setOcrProgress(30);
      setError(null);
      
      try {
        // Gửi ảnh lên server
        const response = useLocalOCR 
          ? await billApi.ocrLocal(base64Data)
          : await billApi.ocr(base64Data, file.type);
        
        setOcrProgress(100);
        
        if (response.success && response.extractedText) {
          setBillText(response.extractedText);
          
          const methodText = response.method === 'tesseract' || response.method === 'tesseract-fallback' 
            ? '📖 Tesseract' 
            : '🤖 AI';
          
          setOcrStatus(`✅ ${methodText} đã đọc xong! Kiểm tra và bấm TÍNH BILL.`);
          
          // Nếu có kết quả tính luôn
          if (response.bill && response.tongThu) {
            setBillLines(response.bill);
            setResult({
              tongThu: response.tongThu,
              tongThuFormatted: response.tongThuFormatted,
              chiTiet: response.chiTiet
            });
            setOcrStatus(`✅ ${methodText} đã đọc và tính xong!`);
          }
        } else {
          setOcrStatus('⚠️ Không đọc được bill từ ảnh. Vui lòng nhập thủ công.');
        }
      } catch (err) {
        console.error('OCR error:', err);
        setOcrStatus('❌ Lỗi đọc ảnh. Vui lòng nhập thủ công.');
        setError(err.response?.data?.error || 'Không thể đọc ảnh');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Lưu bill
  const handleSaveBill = async () => {
    if (billLines.length === 0) {
      setError('Không có bill để lưu');
      return;
    }
    
    setLoading(true);
    try {
      const data = await billApi.create({
        bill: billLines,
        text: billText,
        ngay: getTodayString()
      });
      alert(`✅ Đã lưu bill #${data.billId}\n💰 Tổng thu: ${data.tongThuFormatted}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Lưu bill thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setBillText('');
    setBillLines([]);
    setResult(null);
    setError(null);
    setImagePreview(null);
    setOcrProgress(0);
    setOcrStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick examples - mobile friendly
  const quickExamples = [
    { label: '📱 BL2', text: '23 45 67 bl2 10d 1dai' },
    { label: '📱 BL3', text: '123 456 bl3 5d hn' },
    { label: '📱 Đá', text: '12 34 56 dv 10d 1dai' },
    { label: '📱 Đầu', text: '5 dau 10d hn' },
  ];

  const insertExample = (text) => {
    setBillText(prev => prev ? prev + '\n' + text : text);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header with mode selector - Mobile optimized */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
              📝 TÍNH BILL THẦU
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Nhập bill để tính tiền thu tự động
            </p>
          </div>
          
          {/* Mode selector - Touch friendly */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setMode('text')}
              className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all touch-action-manipulation ${
                mode === 'text' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              ⌨️ Text
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all touch-action-manipulation ${
                mode === 'image' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              📷 Ảnh
            </button>
            <button
              onClick={() => setMode('form')}
              className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all touch-action-manipulation ${
                mode === 'form' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 active:bg-gray-200'
              }`}
            >
              📋 Form
            </button>
          </div>
        </div>
      </div>

      {/* Quick result card - Show prominently on mobile */}
      {result && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm opacity-80">💰 TỔNG THU</div>
              <div className="text-2xl sm:text-3xl font-bold mt-1">{result.tongThuFormatted}</div>
            </div>
            <button
              onClick={handleSaveBill}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 active:bg-white/40 py-3 px-4 rounded-xl text-sm font-medium transition-all"
            >
              💾 Lưu
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 p-2">✕</button>
        </div>
      )}

      {/* Main input area - Full width on mobile */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {mode === 'text' && (
          <div className="space-y-4">
            {/* Quick examples - Scrollable on mobile */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 w-full sm:w-auto">Ví dụ:</span>
              {quickExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => insertExample(ex.text)}
                  className="text-xs py-2 px-3 bg-blue-50 text-blue-600 rounded-full active:bg-blue-100 transition-colors touch-action-manipulation"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập bill (mỗi dòng một số/nhóm)
              </label>
              <textarea
                ref={textareaRef}
                value={billText}
                onChange={(e) => setBillText(e.target.value)}
                className="w-full min-h-[200px] border border-gray-300 rounded-xl px-4 py-3 font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder={`Ví dụ:
23 45 67 bl2 10d 1dai
89 12 bd 5d hn
34 56 78 da vong 2d
5 dau 10d hn`}
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
              />
            </div>

            {/* Action buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleParseBill}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold active:from-blue-600 active:to-indigo-700 transition-all shadow-lg disabled:opacity-50 text-lg"
              >
                {loading ? '⏳ Đang tính...' : '🧮 TÍNH BILL'}
              </button>
              <button
                onClick={handleReset}
                className="py-4 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold active:bg-gray-300 transition-all"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        )}

        {mode === 'image' && (
          <div className="space-y-4">
            {/* Toggle AI vs Local OCR */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Phương thức đọc ảnh:</span>
                <span className="text-gray-500 ml-2 text-xs">
                  {useLocalOCR ? '(Miễn phí, offline)' : '(Cần API key)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${!useLocalOCR ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>🤖 AI</span>
                <button
                  onClick={() => setUseLocalOCR(!useLocalOCR)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    useLocalOCR ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    useLocalOCR ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-xs ${useLocalOCR ? 'text-green-600 font-medium' : 'text-gray-400'}`}>📖 Local</span>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image upload area - Large touch target */}
            {!imagePreview ? (
              <div 
                onClick={triggerFileUpload}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center cursor-pointer active:border-blue-400 active:bg-blue-50 transition-all"
              >
                <div className="text-6xl mb-4">📷</div>
                <p className="text-gray-600 font-medium text-lg">Chạm để chụp/chọn ảnh</p>
                <p className="text-gray-400 text-sm mt-2">Hỗ trợ: JPG, PNG, WEBP</p>
                <p className={`text-xs mt-3 ${useLocalOCR ? 'text-green-500' : 'text-blue-500'}`}>
                  {useLocalOCR ? '📖 Đọc bằng Tesseract (miễn phí)' : '🤖 Đọc bằng Gemini AI'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Bill preview" 
                    className="w-full max-h-48 sm:max-h-64 object-contain rounded-xl border"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setOcrStatus('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white w-10 h-10 rounded-full active:bg-red-600 text-lg"
                  >
                    ✕
                  </button>
                </div>
                
                {/* OCR Progress */}
                {loading && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin">⏳</div>
                      <div className="flex-1">
                        <div className="text-blue-700 text-sm font-medium">{ocrStatus}</div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!loading && ocrStatus && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-xl">
                    <p className="text-green-700 text-sm">{ocrStatus}</p>
                  </div>
                )}

                <textarea
                  value={billText}
                  onChange={(e) => setBillText(e.target.value)}
                  className="w-full min-h-[150px] border border-gray-300 rounded-xl px-4 py-3 font-mono text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Nội dung từ hình ảnh..."
                  style={{ fontSize: '16px' }}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleParseBill}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg text-lg"
                  >
                    {loading ? '⏳ Đang tính...' : '🧮 TÍNH BILL'}
                  </button>
                  <button
                    onClick={handleReset}
                    className="py-4 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'form' && (
          <BillForm onCalculate={handleCalculateBill} loading={loading} />
        )}
      </div>

      {/* Hướng dẫn - Collapsible on mobile */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
        <button 
          onClick={() => setShowQuickRef(!showQuickRef)}
          className="w-full flex items-center justify-between text-left font-bold text-gray-700 py-2"
        >
          <span>📖 Hướng dẫn nhập</span>
          <span className="text-xl">{showQuickRef ? '−' : '+'}</span>
        </button>
        
        {showQuickRef && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-blue-600 font-medium text-xs">23 45 bl2 10d 1dai</code>
              <p className="text-gray-500 mt-1 text-xs">Bao lô 2 số, 10 điểm, 1 đài</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-blue-600 font-medium text-xs">123 bd 5d hn</code>
              <p className="text-gray-500 mt-1 text-xs">Bao đảo 3 số, 5 điểm, Hà Nội</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-blue-600 font-medium text-xs">12 34 56 dv 5d</code>
              <p className="text-gray-500 mt-1 text-xs">Đá vòng 3 số, 5 điểm</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-blue-600 font-medium text-xs">5 dau 10d hn</code>
              <p className="text-gray-500 mt-1 text-xs">Đầu số 5, 10 điểm, HN</p>
            </div>
            
            {/* Bảng hệ số nhanh */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-bold text-gray-700 mb-3">💰 Hệ số thu (×1000đ)</h4>
              <div className="overflow-x-auto -mx-3 px-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Loại</th>
                      <th className="p-2 text-center">1Đ</th>
                      <th className="p-2 text-center">2Đ</th>
                      <th className="p-2 text-center">HN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(BANG_HE_SO_THU).slice(0, 5).map(([key, val]) => (
                      <tr key={key} className="border-b">
                        <td className="p-2 font-medium">{key}</td>
                        <td className="p-2 text-center text-blue-600">{val['1D'] || '-'}</td>
                        <td className="p-2 text-center text-blue-600">{val['2D'] || '-'}</td>
                        <td className="p-2 text-center text-blue-600">{val['HN'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chi tiết kết quả */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <BillResult 
            result={result} 
            onSave={handleSaveBill}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default BillCalculator;
