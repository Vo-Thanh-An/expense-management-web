import { HttpError } from './http.js';
import { SAVING_CATEGORY, isValidCategory } from '../../../shared/categories.js';

export const MAX_AMOUNT = 1_000_000_000_000; // 1.000 tỷ VNĐ
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function requireString(value, field, { min = 1, max = 200 } = {}) {
  if (typeof value !== 'string') throw new HttpError(400, `Thiếu trường "${field}"`);
  const s = value.trim();
  if (s.length < min) throw new HttpError(400, `"${field}" phải có ít nhất ${min} ký tự`);
  if (s.length > max) throw new HttpError(400, `"${field}" tối đa ${max} ký tự`);
  return s;
}

export function requireEmail(value) {
  const email = requireString(value, 'email', { max: 120 }).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Email không hợp lệ');
  return email;
}

export function requirePassword(value, message = 'Mật khẩu phải có ít nhất 6 ký tự') {
  const password = typeof value === 'string' ? value : '';
  if (password.length < 6 || password.length > 200) throw new HttpError(400, message);
  return password;
}

/** Số tiền VNĐ: số nguyên dương, chấp nhận cả chuỗi số. */
export function requireAmount(value, field = 'amount') {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (!Number.isInteger(n) || n <= 0 || n > MAX_AMOUNT) {
    throw new HttpError(400, `"${field}" phải là số nguyên dương (VNĐ)`);
  }
  return n;
}

/** Ngày dạng YYYY-MM-DD và phải là ngày có thật (chặn 2026-02-30). */
export function requireDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw new HttpError(400, 'Ngày không hợp lệ (định dạng YYYY-MM-DD)');
  }
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, 'Ngày không tồn tại');
  }
  return value;
}

export function parseTransactionInput(body) {
  const { type } = body;
  if (type !== 'INCOME' && type !== 'EXPENSE') throw new HttpError(400, 'Loại giao dịch phải là INCOME hoặc EXPENSE');
  if (!isValidCategory(type, body.category)) throw new HttpError(400, 'Danh mục không hợp lệ');
  if (body.category === SAVING_CATEGORY) {
    throw new HttpError(400, 'Hãy dùng chức năng "Nạp quỹ" để trích tiền vào quỹ mục tiêu');
  }
  return {
    type,
    category: body.category,
    amount: requireAmount(body.amount),
    date: requireDate(body.date),
    note: typeof body.note === 'string' ? body.note.trim().slice(0, 200) : ''
  };
}
