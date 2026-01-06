/**
 * ================================================================
 * NETLIFY FUNCTION - API Handler
 * ================================================================
 * Chuyển đổi Express routes sang Netlify Serverless Functions
 */

// Calculator functions (inline để tránh import issues)
const BANG_HE_SO_THU = {
  'bl2': { '1dai': 14.4, '2dai': 14.4, 'hn': 14.4, 'chung': 14.4 },
  'bl3': { '1dai': 13.6, '2dai': 13.6, 'hn': 13.6, 'chung': 13.6 },
  'bl4': { '1dai': 12.8, '2dai': 12.8, 'hn': 12.8, 'chung': 12.8 },
  'bd': { '1dai': 14.4, '2dai': 14.4, 'hn': 14.4, 'chung': 14.4 },
  'da': { '1dai': 28.8, '2dai': 28.8, 'hn': 28.8, 'chung': 28.8 },
  'dv': { '1dai': 28.8, '2dai': 28.8, 'hn': 28.8, 'chung': 28.8 },
  'dau': { '1dai': 0.8, '2dai': 0.8, 'hn': 0.8, 'chung': 0.8 },
  'duoi': { '1dai': 0.8, '2dai': 0.8, 'hn': 0.8, 'chung': 0.8 },
  'xien2': { '1dai': 2.0, '2dai': 2.0, 'hn': 2.0, 'chung': 2.0 },
  'xien3': { '1dai': 2.0, '2dai': 2.0, 'hn': 2.0, 'chung': 2.0 },
  'xien4': { '1dai': 2.0, '2dai': 2.0, 'hn': 2.0, 'chung': 2.0 }
};

// Format money VND
const formatMoney = (amount) => {
  const rounded = Math.ceil(amount / 1000) * 1000;
  return new Intl.NumberFormat('vi-VN').format(rounded) + 'đ';
};

// Parse bill text
const parseBillText = (text) => {
  const lines = text.trim().split('\n').filter(line => line.trim());
  const bill = [];
  
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    
    // Extract numbers (2-4 digits)
    const numbers = lower.match(/\b\d{2,4}\b/g) || [];
    if (numbers.length === 0) continue;
    
    // Detect play type
    let kieuChoi = 'bl2';
    if (/bd|bao\s*dao|bao\s*đảo/.test(lower)) kieuChoi = 'bd';
    else if (/bl4|bao\s*lo\s*4|bao\s*lô\s*4/.test(lower)) kieuChoi = 'bl4';
    else if (/bl3|bao\s*lo\s*3|bao\s*lô\s*3/.test(lower)) kieuChoi = 'bl3';
    else if (/dv|da\s*vong|đá\s*vòng/.test(lower)) kieuChoi = 'dv';
    else if (/\bda\b|đá/.test(lower)) kieuChoi = 'da';
    else if (/dau|đầu/.test(lower)) kieuChoi = 'dau';
    else if (/duoi|đuôi/.test(lower)) kieuChoi = 'duoi';
    else if (/xien4|xiên4/.test(lower)) kieuChoi = 'xien4';
    else if (/xien3|xiên3/.test(lower)) kieuChoi = 'xien3';
    else if (/xien2|xiên2|xien|xiên/.test(lower)) kieuChoi = 'xien2';
    
    // Extract points
    const diemMatch = lower.match(/(\d+)\s*[dđ](?!\d)/i);
    const diem = diemMatch ? parseFloat(diemMatch[1]) : 1;
    
    // Detect station type
    let loaiDai = '1dai';
    if (/2\s*dai|hai\s*dai|2đài/.test(lower)) loaiDai = '2dai';
    else if (/\bhn\b|ha\s*noi|hà\s*nội/.test(lower)) loaiDai = 'hn';
    else if (/chung|bc/.test(lower)) loaiDai = 'chung';
    
    bill.push({
      cacSo: numbers,
      kieuChoi,
      diem,
      loaiDai,
      dongGoc: line.trim()
    });
  }
  
  return bill;
};

// Calculate revenue
const calculateRevenue = (bill) => {
  let tongThu = 0;
  const chiTietTungDong = [];
  
  for (const dong of bill) {
    const heSo = BANG_HE_SO_THU[dong.kieuChoi]?.[dong.loaiDai] || 0;
    let soLuong = dong.cacSo.length;
    
    // Special calculation for da/dv
    if (dong.kieuChoi === 'da' || dong.kieuChoi === 'dv') {
      const n = dong.cacSo.length;
      soLuong = (n * (n - 1)) / 2;
    }
    
    // Multiply by 2 for 2dai
    const heSoDai = dong.loaiDai === '2dai' ? 2 : 1;
    const tienThu = Math.ceil((dong.diem * heSo * soLuong * heSoDai * 1000) / 1000) * 1000;
    
    tongThu += tienThu;
    
    chiTietTungDong.push({
      dong: dong.dongGoc,
      cacSo: dong.cacSo,
      kieuChoi: dong.kieuChoi,
      diem: dong.diem,
      loaiDai: dong.loaiDai,
      heSo,
      soLuong,
      tienThu,
      tienThuFormatted: formatMoney(tienThu),
      moTa: `${dong.cacSo.join(',')} ${dong.kieuChoi} ${dong.diem}đ ${dong.loaiDai}`
    });
  }
  
  return {
    tongThu,
    tongThuFormatted: formatMoney(tongThu),
    chiTietTungDong
  };
};

// Main handler
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
  const method = event.httpMethod;
  
  try {
    // Health check
    if (path === '/health' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'ok', 
          message: 'Thầu Calculator API (Netlify)',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Parse bill
    if (path === '/bill/parse' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { text } = body;
      
      if (!text) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Thiếu nội dung bill' })
        };
      }
      
      const bill = parseBillText(text);
      const { tongThu, tongThuFormatted, chiTietTungDong } = calculateRevenue(bill);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          bill,
          tongThu,
          tongThuFormatted,
          chiTiet: chiTietTungDong
        })
      };
    }
    
    // Calculate bill
    if (path === '/bill/calculate' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { bill } = body;
      
      if (!bill || !Array.isArray(bill)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Thiếu dữ liệu bill' })
        };
      }
      
      const result = calculateRevenue(bill);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          thu: {
            tong: result.tongThu,
            tongFormatted: result.tongThuFormatted,
            chiTiet: result.chiTietTungDong
          }
        })
      };
    }
    
    // 404 for unknown routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'API endpoint not found', path })
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
