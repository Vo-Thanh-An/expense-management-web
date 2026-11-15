// Các truy vấn đọc dữ liệu dùng chung giữa nhiều route.
// `db` có thể là database chính hoặc `tx` bên trong một transaction (cùng interface).

const TX_COLUMNS = 'id, type, category, amount, date, note, goal_id AS goalId';
const GOAL_COLUMNS = 'id, name, target, current, icon, color';

export const publicUser = u => ({ id: u.id, name: u.name, email: u.email, tier: u.tier });

export const listTransactions = (db, userId) =>
  db.all(`SELECT ${TX_COLUMNS} FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC`, userId);

export const getTransaction = (db, userId, id) =>
  db.get(`SELECT ${TX_COLUMNS} FROM transactions WHERE user_id = ? AND id = ?`, userId, id);

export const listGoals = (db, userId) =>
  db.all(`SELECT ${GOAL_COLUMNS} FROM goals WHERE user_id = ? ORDER BY id`, userId);

export const getGoal = (db, userId, id) =>
  db.get(`SELECT ${GOAL_COLUMNS} FROM goals WHERE user_id = ? AND id = ?`, userId, id);

/** Hạn mức dạng { [category]: amount } */
export async function getBudgets(db, userId) {
  const rows = await db.all('SELECT category, amount FROM budgets WHERE user_id = ?', userId);
  return Object.fromEntries(rows.map(r => [r.category, r.amount]));
}

/** Số dư khả dụng = tổng thu − tổng chi */
export async function getBalance(db, userId) {
  const row = await db.get(`
    SELECT COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE -amount END), 0) AS balance
    FROM transactions WHERE user_id = ?
  `, userId);
  return Number(row.balance);
}
