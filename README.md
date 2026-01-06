# 📊 THẦU CALCULATOR

Hệ thống tính toán lô đề cho **THẦU** - Web App + Telegram Bot

## 🎯 Tính năng

### Web App
- ✅ Nhập bill khách đánh (text hoặc form)
- ✅ Tự động tính tiền THU
- ✅ Tự động tính tiền TRẢ khi có kết quả
- ✅ Tính LỜI/LỖ cho thầu
- ✅ Thống kê theo ngày

### Telegram Bot
- ✅ `/bill` - Gửi bill mới
- ✅ `/ketqua` - Nhập kết quả xổ số
- ✅ `/thongke` - Xem thống kê ngày
- ✅ Tự động so kết quả và báo cáo

## 📐 Logic tính toán (cho THẦU)

### 1. Đơn vị
- **Điểm** chỉ là đơn vị quy ước
- KHÔNG dùng 1 điểm = 1.000đ
- Mọi tiền = điểm × hệ số

### 2. Bảng hệ số THU (tiền thầu thu từ khách)

| Loại | 1 Đài | 2 Đài | Hà Nội | Bao Chung |
|------|-------|-------|--------|-----------|
| BL 2 số | 14.4 | 28.8 | 21.6 | 74 |
| Đầu/Đuôi | 14.4 | 28.8 | 21.6 | 74 |
| BL 3 số | 1.4 | 2.8 | 2.1 | 7.4 |
| Đá | 14.4 | 28.8 | 21.6 | - |

### 3. Bảng THƯỞNG (tiền thầu trả khi khách trúng)

| Loại | Thưởng / điểm / 1 lần về |
|------|---------------------------|
| Bao lô 2 số | 74.000đ |
| Bao lô 3 số | 640.000đ |
| Đá 1 đài | 730.000đ |
| Đầu/Đuôi | 74.000đ |

### 4. Công thức

```
TIỀN THU:
- Bao thường: điểm × hệ_số
- Bao đảo: điểm × số_đảo × hệ_số
- Đá vòng: điểm × số_cặp × hệ_số

TIỀN TRẢ:
- điểm × tiền_thưởng × số_lần_trúng

LỜI/LỖ = TIỀN THU - TIỀN TRẢ
- Lời: Thu > Trả
- Lỗ: Thu < Trả
```

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Clone và cài dependencies

```bash
cd thau-calculator

# Cài dependencies cho server và bot
npm install

# Cài dependencies cho client
cd client && npm install && cd ..
```

### Bước 2: Cấu hình

```bash
# Copy file env mẫu
cp .env.example .env

# Sửa file .env với thông tin của bạn
# - TELEGRAM_BOT_TOKEN: Lấy từ @BotFather
```

### Bước 3: Khởi tạo database

```bash
npm run db:init
```

### Bước 4: Chạy ứng dụng

```bash
# Chạy tất cả (server + client + bot)
npm run dev

# Hoặc chạy riêng từng phần
npm run dev:server  # Server API: http://localhost:3001
npm run dev:client  # Web App: http://localhost:5173
npm run dev:bot     # Telegram Bot
```

## 📝 Hướng dẫn sử dụng

### Web App

1. **Nhập bill**:
   - Chọn tab "Nhập Bill"
   - Nhập theo format text hoặc dùng form
   - Format text: `số điểm kiểu đài`
   
   ```
   23 45 67 bl2 10d 1dai
   89 12 bd 5d hn
   34 56 78 da vong 2d
   ```

2. **Nhập kết quả**:
   - Chọn tab "Kết Quả"
   - Nhập các giải xổ số
   - Hệ thống tự trích xuất 2 số cuối

3. **Xem thống kê**:
   - Chọn tab "Thống Kê"
   - Xem báo cáo theo ngày

### Telegram Bot

1. Tìm bot của bạn trên Telegram
2. Gõ `/start` để bắt đầu
3. Các lệnh:
   - `/bill` - Gửi bill mới
   - `/ketqua` - Nhập kết quả
   - `/thongke` - Xem thống kê
   - `/help` - Hướng dẫn

## 📁 Cấu trúc dự án

```
thau-calculator/
├── server/                 # Backend Express
│   ├── config/
│   │   └── constants.js    # Hệ số và hằng số
│   ├── lib/
│   │   └── calculator.js   # Logic tính toán
│   ├── db/
│   │   └── database.js     # SQLite database
│   ├── routes/
│   │   ├── bill.js         # API bill
│   │   └── ketqua.js       # API kết quả
│   └── index.js            # Server entry
│
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── index.html
│
├── bot/                    # Telegram Bot
│   └── index.js
│
├── tests/                  # Tests
│   └── calculator.test.js
│
├── data/                   # Database files
└── package.json
```

## 🧪 Chạy test

```bash
npm test
```

## 📄 API Endpoints

### Bill
- `POST /api/bill/parse` - Parse bill từ text
- `POST /api/bill/calculate` - Tính toán bill
- `POST /api/bill/create` - Tạo bill mới
- `GET /api/bill/:id` - Lấy bill theo ID
- `GET /api/bill/date/:date` - Lấy bills theo ngày
- `POST /api/bill/:id/result` - Cập nhật kết quả

### Kết quả
- `POST /api/ketqua/parse` - Parse kết quả từ text
- `POST /api/ketqua/save` - Lưu kết quả
- `GET /api/ketqua/:ngay` - Lấy kết quả theo ngày
- `POST /api/ketqua/apply/:ngay` - Áp dụng kết quả cho bills

## ⚠️ Lưu ý

- Đây là công cụ tính toán, **chỉ dùng cho mục đích tham khảo**
- Logic được thiết kế cho **THẦU**, không phải người chơi
- Hệ số và thưởng có thể điều chỉnh trong `server/config/constants.js`

## 📜 License

MIT
# Trigger redeploy Tue Jan  6 22:51:50 +07 2026
