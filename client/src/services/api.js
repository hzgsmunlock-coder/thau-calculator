/**
 * ================================================================
 * API Service - Gọi API backend
 * ================================================================
 */

import axios from 'axios';

// Auto-detect API URL: local dev vs production
const API_BASE = import.meta.env.PROD 
  ? 'https://ok-production-01c9.up.railway.app/api'  // Railway backend
  : '/api';  // Local dev với proxy

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ================================================================
// Bill APIs
// ================================================================

export const billApi = {
  /**
   * Parse bill từ text
   */
  parse: async (text) => {
    const response = await api.post('/bill/parse', { text });
    return response.data;
  },

  /**
   * OCR - Đọc bill từ ảnh (AI với fallback Tesseract)
   */
  ocr: async (imageBase64, mimeType = 'image/jpeg') => {
    const response = await api.post('/bill/ocr', { 
      image: imageBase64,
      mimeType 
    });
    return response.data;
  },

  /**
   * OCR Local - Chỉ dùng Tesseract (không cần API)
   */
  ocrLocal: async (imageBase64) => {
    const response = await api.post('/bill/ocr-local', { 
      image: imageBase64
    });
    return response.data;
  },

  /**
   * Smart Calculate - AI tự phân tích và tính
   */
  smartCalc: async (imageBase64, mimeType = 'image/jpeg') => {
    const response = await api.post('/bill/smart-calc', { 
      image: imageBase64,
      mimeType 
    });
    return response.data;
  },

  /**
   * Tính toán bill (không lưu)
   */
  calculate: async (bill, ketQua = null) => {
    const response = await api.post('/bill/calculate', { bill, ketQua });
    return response.data;
  },

  /**
   * Tạo bill mới
   */
  create: async (data) => {
    const response = await api.post('/bill/create', data);
    return response.data;
  },

  /**
   * Lấy bill theo ID
   */
  getById: async (id) => {
    const response = await api.get(`/bill/${id}`);
    return response.data;
  },

  /**
   * Lấy bills theo ngày
   */
  getByDate: async (date) => {
    const response = await api.get(`/bill/date/${date}`);
    return response.data;
  },

  /**
   * Xóa bill
   */
  delete: async (id) => {
    const response = await api.delete(`/bill/${id}`);
    return response.data;
  },

  /**
   * Cập nhật kết quả cho bill
   */
  updateResult: async (id, ketQua) => {
    const response = await api.post(`/bill/${id}/result`, { ketQua });
    return response.data;
  }
};

// ================================================================
// Kết quả APIs
// ================================================================

export const ketQuaApi = {
  /**
   * Lưu kết quả xổ số
   */
  save: async (data) => {
    const response = await api.post('/ketqua/save', data);
    return response.data;
  },

  /**
   * Parse kết quả từ text
   */
  parse: async (text, ngay, dai) => {
    const response = await api.post('/ketqua/parse', { text, ngay, dai });
    return response.data;
  },

  /**
   * Lấy kết quả theo ngày
   */
  getByDate: async (ngay) => {
    const response = await api.get(`/ketqua/${ngay}`);
    return response.data;
  },

  /**
   * Áp dụng kết quả cho bills trong ngày
   */
  apply: async (ngay, ketQua) => {
    const response = await api.post(`/ketqua/apply/${ngay}`, { ketQua });
    return response.data;
  }
};

export default api;
