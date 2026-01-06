/**
 * ================================================================
 * LOCAL OCR - Đọc ảnh bằng Tesseract.js (không cần API)
 * ================================================================
 */

import Tesseract from 'tesseract.js';

/**
 * Đọc text từ hình ảnh bằng Tesseract OCR
 * @param {string} imageData - Base64 image data hoặc URL
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export const extractTextWithTesseract = async (imageData) => {
  try {
    console.log('🔍 Đang đọc ảnh bằng Tesseract OCR...');
    
    const result = await Tesseract.recognize(
      imageData,
      'vie+eng', // Vietnamese + English
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r📖 OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('\n✅ OCR hoàn tất!');
    
    const text = result.data.text.trim();
    
    if (!text) {
      return {
        success: false,
        error: 'Không đọc được text từ ảnh'
      };
    }
    
    // Cố gắng parse thành bill format
    const parsedBill = parseOCRToBill(text);
    
    return {
      success: true,
      text: parsedBill || text,
      rawText: text
    };
    
  } catch (error) {
    console.error('❌ OCR error:', error.message);
    return {
      success: false,
      error: 'Lỗi đọc ảnh: ' + error.message
    };
  }
};

/**
 * Parse OCR text thành bill format chuẩn
 * @param {string} ocrText - Raw text từ OCR
 * @returns {string|null} - Bill format hoặc null
 */
const parseOCRToBill = (ocrText) => {
  if (!ocrText) return null;
  
  const lines = ocrText.split('\n').filter(line => line.trim());
  const billLines = [];
  
  for (const line of lines) {
    const cleaned = line.trim().toLowerCase();
    
    // Tìm pattern số + kiểu chơi + điểm + đài
    // Ví dụ: "23 45 67 bl2 10d 1dai"
    
    // Kiểm tra có chứa các từ khóa bill không
    const hasKeywords = /bl[234]|bd|bao|đá|da|dv|dau|đầu|duoi|đuôi|xien|xiên|dd/i.test(cleaned);
    const hasNumbers = /\d{2,4}/.test(cleaned);
    const hasDiem = /\d+d\b|\d+đ\b/i.test(cleaned);
    
    if (hasNumbers && (hasKeywords || hasDiem)) {
      // Chuẩn hóa line
      let normalized = cleaned
        // Fix common OCR errors
        .replace(/[oO]/g, '0')
        .replace(/[lI]/g, '1')
        .replace(/\s+/g, ' ')
        // Normalize keywords
        .replace(/bao\s*2|b2/gi, 'bl2')
        .replace(/bao\s*3|b3/gi, 'bl3')
        .replace(/bao\s*lo\s*2/gi, 'bl2')
        .replace(/bao\s*lo\s*3/gi, 'bl3')
        .replace(/bao\s*dao|bđ/gi, 'bd')
        .replace(/đá\s*vòng|da\s*vong/gi, 'dv')
        .replace(/đầu/gi, 'dau')
        .replace(/đuôi/gi, 'duoi')
        .replace(/xiên/gi, 'xien')
        .replace(/1\s*đài|1\s*dai/gi, '1dai')
        .replace(/2\s*đài|2\s*dai/gi, '2dai')
        .replace(/hà\s*nội|ha\s*noi/gi, 'hn')
        // Clean điểm format
        .replace(/(\d+)\s*điểm/gi, '$1d')
        .replace(/(\d+)\s*đ\b/gi, '$1d');
      
      billLines.push(normalized.trim());
    }
  }
  
  if (billLines.length === 0) {
    return null;
  }
  
  return billLines.join('\n');
};

export default {
  extractTextWithTesseract
};
