/**
 * ================================================================
 * TEST - Kiểm tra logic tính toán
 * ================================================================
 */

import {
  calculateLineRevenue,
  calculateRevenue,
  calculateLinePayout,
  calculatePayout,
  calculateProfit,
  calculateBill,
  parseBillText
} from '../server/lib/calculator.js';

import {
  tinhSoDao,
  taoSoDao,
  tinhSoCapDa,
  taoCapDa,
  KIEU_CHOI,
  LOAI_DAI
} from '../server/config/constants.js';

console.log('🧪 BẮT ĐẦU TEST LOGIC TÍNH TOÁN CHO THẦU\n');
console.log('═'.repeat(60));

// ================================================================
// TEST 1: Hàm tính số đảo
// ================================================================
console.log('\n📌 TEST 1: Tính số đảo');
console.log('─'.repeat(40));

const testSoDao = [
  { so: '12', expected: 2, desc: '2 số khác nhau' },
  { so: '11', expected: 1, desc: '2 số giống nhau' },
  { so: '123', expected: 6, desc: '3 số khác nhau' },
  { so: '112', expected: 3, desc: '2 số giống nhau' },
  { so: '111', expected: 1, desc: '3 số giống nhau' }
];

testSoDao.forEach(test => {
  const result = tinhSoDao(test.so);
  const pass = result === test.expected;
  console.log(`${pass ? '✅' : '❌'} ${test.so} (${test.desc}): ${result} đảo ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 2: Hàm tính số cặp đá
// ================================================================
console.log('\n📌 TEST 2: Tính số cặp đá vòng');
console.log('─'.repeat(40));

const testCapDa = [
  { numbers: ['12', '34'], expected: 1 },
  { numbers: ['12', '34', '56'], expected: 3 },
  { numbers: ['12', '34', '56', '78'], expected: 6 }
];

testCapDa.forEach(test => {
  const result = tinhSoCapDa(test.numbers);
  const pass = result === test.expected;
  console.log(`${pass ? '✅' : '❌'} ${test.numbers.length} số → ${result} cặp ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 3: Tính tiền thu - Bao lô 2 số
// ================================================================
console.log('\n📌 TEST 3: Tính tiền THU - Bao lô 2 số');
console.log('─'.repeat(40));

const testBL2 = [
  {
    line: { numbers: ['23'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
    expected: 10 * 14.4,
    desc: '1 số, 10 điểm, 1 đài'
  },
  {
    line: { numbers: ['23', '45', '67'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
    expected: 3 * 10 * 14.4,
    desc: '3 số, 10 điểm, 1 đài'
  },
  {
    line: { numbers: ['23'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.HAI_DAI },
    expected: 10 * 28.8,
    desc: '1 số, 10 điểm, 2 đài'
  },
  {
    line: { numbers: ['23'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.HA_NOI },
    expected: 10 * 21.6,
    desc: '1 số, 10 điểm, Hà Nội'
  }
];

testBL2.forEach(test => {
  const { tienThu } = calculateLineRevenue(test.line);
  const pass = Math.abs(tienThu - test.expected) < 0.01;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${tienThu.toLocaleString()}đ ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 4: Tính tiền thu - Bao đảo
// ================================================================
console.log('\n📌 TEST 4: Tính tiền THU - Bao đảo');
console.log('─'.repeat(40));

const testBaoDao = [
  {
    line: { numbers: ['123'], diem: 10, kieuChoi: KIEU_CHOI.BAO_DAO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 123 có 6 số đảo
    expected: 10 * 6 * 14.4,
    desc: '123 (6 đảo), 10 điểm, 1 đài'
  },
  {
    line: { numbers: ['112'], diem: 10, kieuChoi: KIEU_CHOI.BAO_DAO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 112 có 3 số đảo
    expected: 10 * 3 * 14.4,
    desc: '112 (3 đảo), 10 điểm, 1 đài'
  },
  {
    line: { numbers: ['111'], diem: 10, kieuChoi: KIEU_CHOI.BAO_DAO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 111 có 1 số đảo
    expected: 10 * 1 * 14.4,
    desc: '111 (1 đảo), 10 điểm, 1 đài'
  }
];

testBaoDao.forEach(test => {
  const { tienThu, chiTiet } = calculateLineRevenue(test.line);
  const pass = Math.abs(tienThu - test.expected) < 0.01;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${tienThu.toLocaleString()}đ ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 5: Tính tiền thu - Đá vòng
// ================================================================
console.log('\n📌 TEST 5: Tính tiền THU - Đá vòng');
console.log('─'.repeat(40));

const testDaVong = [
  {
    line: { numbers: ['12', '34'], diem: 10, kieuChoi: KIEU_CHOI.DA_VONG, loaiDai: LOAI_DAI.MOT_DAI },
    // 2 số = 1 cặp
    expected: 10 * 1 * 14.4,
    desc: '2 số (1 cặp), 10 điểm'
  },
  {
    line: { numbers: ['12', '34', '56'], diem: 10, kieuChoi: KIEU_CHOI.DA_VONG, loaiDai: LOAI_DAI.MOT_DAI },
    // 3 số = 3 cặp
    expected: 10 * 3 * 14.4,
    desc: '3 số (3 cặp), 10 điểm'
  },
  {
    line: { numbers: ['12', '34', '56', '78'], diem: 10, kieuChoi: KIEU_CHOI.DA_VONG, loaiDai: LOAI_DAI.MOT_DAI },
    // 4 số = 6 cặp
    expected: 10 * 6 * 14.4,
    desc: '4 số (6 cặp), 10 điểm'
  }
];

testDaVong.forEach(test => {
  const { tienThu, chiTiet } = calculateLineRevenue(test.line);
  const pass = Math.abs(tienThu - test.expected) < 0.01;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${tienThu.toLocaleString()}đ ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 6: Tính tiền trả khi trúng
// ================================================================
console.log('\n📌 TEST 6: Tính tiền TRẢ khi trúng');
console.log('─'.repeat(40));

const ketQuaTest = {
  lo2so: ['23', '45', '67', '23'], // 23 về 2 lần
  lo3so: ['123', '456'],
  dau: '2',
  duoi: '3'
};

const testTra = [
  {
    line: { numbers: ['23'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 23 về 2 lần → 10 điểm × 74.000 × 2 = 1.480.000
    expected: 10 * 74000 * 2,
    desc: '23 về 2 lần'
  },
  {
    line: { numbers: ['45'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 45 về 1 lần → 10 điểm × 74.000 = 740.000
    expected: 10 * 74000 * 1,
    desc: '45 về 1 lần'
  },
  {
    line: { numbers: ['99'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
    // 99 không về → 0
    expected: 0,
    desc: '99 không về'
  }
];

testTra.forEach(test => {
  const { tienTra } = calculateLinePayout(test.line, ketQuaTest);
  const pass = tienTra === test.expected;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${tienTra.toLocaleString()}đ ${pass ? '' : `(expected ${test.expected})`}`);
});

// ================================================================
// TEST 7: Tính lời/lỗ
// ================================================================
console.log('\n📌 TEST 7: Tính LỜI/LỖ');
console.log('─'.repeat(40));

const testProfit = [
  { tongThu: 1000000, tongTra: 500000, expectedKetQua: 'LOI', desc: 'Thu > Trả = LỜI' },
  { tongThu: 500000, tongTra: 1000000, expectedKetQua: 'LO', desc: 'Thu < Trả = LỖ' },
  { tongThu: 1000000, tongTra: 1000000, expectedKetQua: 'LOI', desc: 'Thu = Trả = HÒA (coi như LỜI)' }
];

testProfit.forEach(test => {
  const profit = calculateProfit(test.tongThu, test.tongTra);
  const pass = profit.ketQua === test.expectedKetQua;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${profit.ketQuaText}`);
});

// ================================================================
// TEST 8: Parse bill từ text
// ================================================================
console.log('\n📌 TEST 8: Parse bill từ text');
console.log('─'.repeat(40));

const testParse = [
  { text: '23 45 bl2 10d 1dai', expectedCount: 1, desc: 'Format đơn giản' },
  { text: '23 45 67 bao lo 2 10 diem 1 dai', expectedCount: 1, desc: 'Format đầy đủ' },
  { text: '23 bd 5d hn', expectedCount: 1, desc: 'Bao đảo Hà Nội' },
  { text: '12 34 56 da vong 10d', expectedCount: 1, desc: 'Đá vòng' }
];

testParse.forEach(test => {
  const bill = parseBillText(test.text);
  const pass = bill.length === test.expectedCount && bill[0]?.numbers?.length > 0;
  console.log(`${pass ? '✅' : '❌'} ${test.desc}: ${bill.length} dòng, ${bill[0]?.numbers?.length || 0} số`);
  if (pass) {
    console.log(`   → Kiểu: ${bill[0].kieuChoi}, Đài: ${bill[0].loaiDai}, Điểm: ${bill[0].diem}`);
  }
});

// ================================================================
// TEST 9: Ví dụ thực tế đầy đủ
// ================================================================
console.log('\n📌 TEST 9: VÍ DỤ THỰC TẾ ĐẦY ĐỦ');
console.log('═'.repeat(60));

const billMau = [
  { numbers: ['23', '45', '67'], diem: 10, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.MOT_DAI },
  { numbers: ['89'], diem: 5, kieuChoi: KIEU_CHOI.BAO_LO_2, loaiDai: LOAI_DAI.HA_NOI },
  { numbers: ['12', '34', '56'], diem: 2, kieuChoi: KIEU_CHOI.DA_VONG, loaiDai: LOAI_DAI.MOT_DAI }
];

const ketQuaMau = {
  lo2so: ['23', '45', '12', '34', '56', '23'], // 23 về 2 lần, cặp 12-34, 12-56, 34-56 trúng
  lo3so: [],
  dau: '2',
  duoi: '3'
};

console.log('\n📋 BILL MẪU:');
billMau.forEach((line, idx) => {
  console.log(`   ${idx + 1}. Số: ${line.numbers.join(', ')} | ${line.diem} điểm | ${line.kieuChoi} | ${line.loaiDai}`);
});

console.log('\n🎰 KẾT QUẢ XỔ SỐ:');
console.log(`   Lô 2 số: ${ketQuaMau.lo2so.join(', ')}`);

const result = calculateBill(billMau, ketQuaMau);

console.log('\n💰 TÍNH TIỀN THU:');
result.thu.chiTiet.forEach(d => {
  console.log(`   Dòng ${d.dong}: ${d.congThuc} = ${d.tienThu.toLocaleString()}đ`);
});
console.log(`   → TỔNG THU: ${result.thu.tong.toLocaleString()}đ`);

console.log('\n💸 TÍNH TIỀN TRẢ:');
if (result.tra.chiTiet.length > 0) {
  result.tra.chiTiet.forEach(d => {
    console.log(`   Dòng ${d.dong}: ${d.numbers?.join(', ')} trúng → ${d.tienTra.toLocaleString()}đ`);
  });
} else {
  console.log('   Không có số trúng');
}
console.log(`   → TỔNG TRẢ: ${result.tra.tong.toLocaleString()}đ`);

console.log('\n📊 KẾT QUẢ:');
console.log(`   ${result.ketQua.ketQuaText}`);
console.log(`   Tỷ lệ: ${result.ketQua.tyLe}%`);

console.log('\n' + '═'.repeat(60));
console.log('🏁 HOÀN THÀNH TEST\n');
