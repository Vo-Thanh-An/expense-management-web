import { HttpError, created } from '../lib/http.js';
import { requireString, requireAmount, requireDate } from '../lib/validation.js';
import { listGoals, getGoal, getTransaction, getBalance } from '../db/queries.js';
import { SAVING_CATEGORY } from '../../../shared/categories.js';

const DEFAULT_COLOR = 'from-emerald-500 to-teal-500';

export function registerGoalRoutes(router, { db }) {
  router.get('/api/goals', ({ user }) => listGoals(db, user.id));

  router.post('/api/goals', async ({ user, body }) => {
    const name = requireString(body.name, 'name', { min: 2, max: 80 });
    const target = requireAmount(body.target, 'target');
    const icon = typeof body.icon === 'string' && body.icon.length <= 8 ? body.icon : '🎯';
    const color = typeof body.color === 'string' && /^[a-z0-9\- ]{1,80}$/.test(body.color) ? body.color : DEFAULT_COLOR;

    const { lastInsertRowid } = await db.run(
      'INSERT INTO goals (user_id, name, target, icon, color) VALUES (?, ?, ?, ?, ?)',
      user.id, name, target, icon, color
    );
    return created(await getGoal(db, user.id, lastInsertRowid));
  });

  router.delete('/api/goals/:id', async ({ user, params }) => {
    const goal = await getGoal(db, user.id, params.id);
    if (!goal) throw new HttpError(404, 'Không tìm thấy quỹ');

    // Xoá quỹ: các khoản đã nạp qua app được xoá theo, tiền quay lại số dư khả dụng
    const removedTransactionIds = await db.transaction(async tx => {
      const rows = await tx.all('SELECT id FROM transactions WHERE goal_id = ? AND user_id = ?', goal.id, user.id);
      await tx.run('DELETE FROM transactions WHERE goal_id = ? AND user_id = ?', goal.id, user.id);
      await tx.run('DELETE FROM goals WHERE id = ? AND user_id = ?', goal.id, user.id);
      return rows.map(r => r.id);
    });
    return { ok: true, removedTransactionIds };
  });

  router.post('/api/goals/:id/deposit', async ({ user, params, body }) => {
    const amount = requireAmount(body.amount);
    const date = typeof body.date === 'string' ? requireDate(body.date) : new Date().toISOString().slice(0, 10);

    return db.transaction(async tx => {
      const goal = await getGoal(tx, user.id, params.id);
      if (!goal) throw new HttpError(404, 'Không tìm thấy quỹ');

      const remaining = goal.target - goal.current;
      if (remaining <= 0) throw new HttpError(400, 'Quỹ này đã đạt mục tiêu');
      const deposited = Math.min(amount, remaining); // chỉ nạp phần còn thiếu
      if ((await getBalance(tx, user.id)) < deposited) throw new HttpError(400, 'Số dư khả dụng không đủ để nạp vào quỹ');

      // Tự tạo khoản chi "Trích quỹ" để trừ vào số dư khả dụng
      const { lastInsertRowid } = await tx.run(`
        INSERT INTO transactions (user_id, type, category, amount, date, note, goal_id)
        VALUES (?, 'EXPENSE', ?, ?, ?, ?, ?)
      `, user.id, SAVING_CATEGORY, deposited, date, `Nạp vào quỹ: ${goal.name}`, goal.id);
      await tx.run('UPDATE goals SET current = current + ? WHERE id = ?', deposited, goal.id);

      return {
        goal: await getGoal(tx, user.id, goal.id),
        transaction: await getTransaction(tx, user.id, lastInsertRowid),
        deposited
      };
    });
  });
}
