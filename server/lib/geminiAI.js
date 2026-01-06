/**
 * ================================================================
 * GEMINI AI - Xử lý hình ảnh bill thông minh với Google AI
 * ================================================================
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini
let genAI = null;
let model = null;

const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY chưa được cấu hình. Tính năng AI sẽ không hoạt động.');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI đã khởi tạo thành công!');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khởi tạo Gemini:', error.message);
    return false;
  }
};

/**
 * Prompt chuyên biệt để đọc bill lô đề
 */
const BILL_EXTRACTION_PROMPT = `Bạn là chuyên gia đọc bill lô đề Việt Nam. Hãy phân tích hình ảnh và trích xuất CHÍNH XÁC nội dung bill.

QUY TẮC:
1. Chỉ trích xuất các dòng chứa số đánh và kiểu chơi
2. Bỏ qua header, footer, logo, watermark
3. Format mỗi dòng: [các số] [kiểu chơi] [điểm]d [đài]

CÁC KIỂU CHƠI PHỔ BIẾN:
- bl2, b2, bao2 = Bao lô 2 số
- bl3, b3, bao3 = Bao lô 3 số  
- bl4, b4 = Bao lô 4 số
- bd, baodao = Bao đảo
- da, dá = Đá thẳng
- dv, da vong, đá vòng = Đá vòng
- x, xien, xiên = Xiên
- dau, đầu = Đầu
- duoi, đuôi = Đuôi
- dd = Đầu đuôi

LOẠI ĐÀI:
- 1d, 1dai, 1đài = 1 đài MN/MT
- 2d, 2dai = 2 đài
- hn, hà nội, hanoi = Hà Nội
- mn = Miền Nam
- mt = Miền Trung

VÍ DỤ OUTPUT:
23 45 67 bl2 10d 1dai
89 12 bd 5d hn
34 56 78 dv 2d 1dai
5 dau 10d hn

CHỈ TRẢ VỀ NỘI DUNG BILL ĐÃ CHUẨN HÓA, KHÔNG GIẢI THÍCH GÌ THÊM.
Nếu không đọc được hoặc không phải bill lô đề, trả về: KHONG_DOC_DUOC`;

/**
 * Đọc bill từ hình ảnh sử dụng Gemini Vision
 * @param {Buffer|string} imageData - Buffer hoặc base64 string của hình ảnh
 * @param {string} mimeType - MIME type của hình ảnh (image/jpeg, image/png, etc.)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
const extractBillFromImage = async (imageData, mimeType = 'image/jpeg') => {
  if (!model) {
    const initialized = initGemini();
    if (!initialized) {
      return { 
        success: false, 
        error: 'Gemini API chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env' 
      };
    }
  }

  try {
    // Convert to base64 if needed
    let base64Data;
    if (Buffer.isBuffer(imageData)) {
      base64Data = imageData.toString('base64');
    } else if (typeof imageData === 'string') {
      // Check if already base64 or data URL
      if (imageData.startsWith('data:')) {
        base64Data = imageData.split(',')[1];
      } else {
        base64Data = imageData;
      }
    } else {
      return { success: false, error: 'Định dạng hình ảnh không hợp lệ' };
    }

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    // Call Gemini Vision
    const result = await model.generateContent([BILL_EXTRACTION_PROMPT, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    if (text === 'KHONG_DOC_DUOC' || !text) {
      return { 
        success: false, 
        error: 'Không thể đọc nội dung bill từ hình ảnh. Vui lòng chụp rõ hơn.' 
      };
    }

    return { 
      success: true, 
      text: text 
    };

  } catch (error) {
    console.error('Gemini Vision error:', error);
    
    // Handle specific errors
    if (error.message?.includes('API_KEY')) {
      return { success: false, error: 'API Key không hợp lệ' };
    }
    if (error.message?.includes('quota')) {
      return { success: false, error: 'Đã hết quota API. Vui lòng thử lại sau.' };
    }
    
    return { 
      success: false, 
      error: `Lỗi xử lý AI: ${error.message}` 
    };
  }
};

/**
 * Tính toán bill thông minh - AI tự phân tích và tính
 * @param {Buffer|string} imageData 
 * @param {string} mimeType 
 * @returns {Promise<{success: boolean, analysis?: object, error?: string}>}
 */
const smartCalculateBill = async (imageData, mimeType = 'image/jpeg') => {
  if (!model) {
    const initialized = initGemini();
    if (!initialized) {
      return { 
        success: false, 
        error: 'Gemini API chưa được cấu hình' 
      };
    }
  }

  const SMART_CALC_PROMPT = `Bạn là chuyên gia tính bill lô đề Việt Nam. Hãy phân tích hình ảnh bill và tính toán.

BẢNG HỆ SỐ THU (đơn vị: nghìn đồng/điểm):
| Kiểu | 1 Đài | 2 Đài | Hà Nội |
|------|-------|-------|--------|
| BL2  | 14.4  | 28.8  | 14.4   |
| BL3  | 13.6  | 27.2  | 13.6   |
| BL4  | 12.8  | 25.6  | 12.8   |
| Đầu/Đuôi | 0.8 | 1.6 | 0.8  |
| Đá   | 28.8  | 57.6  | 25.6   |

CÔNG THỨC:
- Tiền thu = Số lượng số × Hệ số × Điểm × 1000 (làm tròn lên đến 1000đ)
- Bao đảo: Nhân thêm số hoán vị (2 số = ×2, 3 số = ×6, 4 số = ×24)
- Đá vòng N số: Có C(N,2) = N×(N-1)/2 cặp

PHÂN TÍCH VÀ TRẢ VỀ JSON:
{
  "bill": [
    {
      "dong": "nội dung gốc",
      "cacSo": ["23", "45"],
      "kieuChoi": "BL2",
      "diem": 10,
      "dai": "1D",
      "tienThu": 288000,
      "giaiThich": "2 số × 14.4 × 10 × 1000 = 288,000đ"
    }
  ],
  "tongThu": 288000,
  "tongThuFormatted": "288,000đ"
}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ MARKDOWN HAY TEXT KHÁC.`;

  try {
    let base64Data;
    if (Buffer.isBuffer(imageData)) {
      base64Data = imageData.toString('base64');
    } else if (typeof imageData === 'string') {
      base64Data = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData;
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([SMART_CALC_PROMPT, imagePart]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const analysis = JSON.parse(text);
      return { 
        success: true, 
        analysis 
      };
    } catch (parseError) {
      // If JSON parse fails, return raw text
      return { 
        success: true, 
        analysis: { rawText: text } 
      };
    }

  } catch (error) {
    console.error('Smart calc error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Initialize on module load
initGemini();

export {
  initGemini,
  extractBillFromImage,
  smartCalculateBill
};
