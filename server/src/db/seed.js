import { CATEGORIES } from '../../../shared/categories.js';
import { hashPassword } from '../auth/password.js';

/** Tạo hạn mức mặc định cho user (db có thể là `tx` trong transaction). */
export async function insertDefaultBudgets(db, userId) {
  for (const c of CATEGORIES.EXPENSE) {
    if (c.budget) await db.run('INSERT OR IGNORE INTO budgets (user_id, category, amount) VALUES (?, ?, ?)', userId, c.id, c.budget);
  }
}

const pad = n => String(n).padStart(2, '0');

/** Xoá dữ liệu cũ và nạp dữ liệu mẫu (tháng này + tháng trước) cho một user. */
export function seedDemoData(db, userId, now = new Date()) {
  const cur = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const p = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prev = `${p.getFullYear()}-${pad(p.getMonth() + 1)}`;
  // Giao dịch tháng này không được nằm sau ngày hôm nay
  const day = d => pad(Math.min(d, now.getDate()));

  const transactions = [
    [18500000, 'INCOME', 'Lương', `${cur}-${day(1)}`, 'Lương tháng này'],
    [2800000, 'EXPENSE', 'Ăn uống', `${cur}-${day(4)}`, 'Ăn uống & Cà phê làm việc'],
    [1350000, 'EXPENSE', 'Hóa đơn', `${cur}-${day(6)}`, 'Tiền điện, nước, cáp quang'],
    [2600000, 'EXPENSE', 'Shopping', `${cur}-${day(9)}`, 'Nâng cấp bàn phím cơ & chuột'],
    [750000, 'EXPENSE', 'Di chuyển', `${cur}-${day(11)}`, 'Đổ xăng & Grab di chuyển'],
    [1200000, 'EXPENSE', 'Giải trí', `${cur}-${day(12)}`, 'Xem phim IMAX & ăn tối'],
    [16500000, 'INCOME', 'Lương', `${prev}-01`, 'Lương tháng trước'],
    [3400000, 'EXPENSE', 'Ăn uống', `${prev}-08`, 'Tiệc sinh nhật & ăn uống'],
    [1200000, 'EXPENSE', 'Hóa đơn', `${prev}-10`, 'Hóa đơn sinh hoạt'],
    [2900000, 'EXPENSE', 'Giải trí', `${prev}-20`, 'Du lịch Đà Lạt cuối tuần']
  ];
  const goals = [
    ['Quỹ Dự Phòng Khẩn Cấp', 30000000, 18500000, '🛡️', 'from-emerald-500 to-teal-500'],
    ['Nâng Cấp Setup PC / Laptop', 25000000, 11000000, '💻', 'from-violet-600 to-indigo-500'],
    ['Du Lịch Xuyên Việt', 15000000, 6500000, '✈️', 'from-amber-500 to-rose-500']
  ];

  return db.transaction(async tx => {
    await tx.run('DELETE FROM transactions WHERE user_id = ?', userId);
    await tx.run('DELETE FROM goals WHERE user_id = ?', userId);
    await tx.run('DELETE FROM budgets WHERE user_id = ?', userId);

    for (const t of transactions) {
      await tx.run('INSERT INTO transactions (user_id, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?)', userId, ...t);
    }
    for (const g of goals) {
      await tx.run('INSERT INTO goals (user_id, name, target, current, icon, color) VALUES (?, ?, ?, ?, ?, ?)', userId, ...g);
    }
    await insertDefaultBudgets(tx, userId);
  });
}

/** Tạo tài khoản demo kèm dữ liệu mẫu nếu chưa có. Trả về true nếu vừa tạo mới. */
export async function ensureDemoUser(db, { email, password, name = 'Võ Thanh An' }) {
  if (await db.get('SELECT 1 AS found FROM users WHERE email = ?', email)) return false;
  const hash = await hashPassword(password);
  const { lastInsertRowid } = await db.run(
    "INSERT INTO users (name, email, password_hash, tier) VALUES (?, ?, ?, 'PRO MEMBER')",
    name, email, hash
  );
  await seedDemoData(db, lastInsertRowid);
  return true;
}
