import { HttpError, created } from '../lib/http.js';
import { parseTransactionInput } from '../lib/validation.js';
import { listTransactions, getTransaction, getGoal } from '../db/queries.js';

export function registerTransactionRoutes(router, { db }) {
  router.get('/api/transactions', ({ user }) => listTransactions(db, user.id));

  router.post('/api/transactions', async ({ user, body }) => {
    const t = parseTransactionInput(body);
    const { lastInsertRowid } = await db.run(
      'INSERT INTO transactions (user_id, type, category, amount, date, note) VALUES (?, ?, ?, ?, ?, ?)',
      user.id, t.type, t.category, t.amount, t.date, t.note
    );
    return created(await getTransaction(db, user.id, lastInsertRowid));
  });

  router.put('/api/transactions/:id', async ({ user, body, params }) => {
    const existing = await getTransaction(db, user.id, params.id);
    if (!existing) throw new HttpError(404, 'Không tìm thấy giao dịch');
    if (existing.goalId) throw new HttpError(400, 'Giao dịch nạp quỹ không sửa được. Hãy xoá rồi nạp lại.');

    const t = parseTransactionInput(body);
    await db.run(
      'UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, note = ? WHERE id = ? AND user_id = ?',
      t.type, t.category, t.amount, t.date, t.note, existing.id, user.id
    );
    return getTransaction(db, user.id, existing.id);
  });

  router.delete('/api/transactions/:id', async ({ user, params }) => {
    const existing = await getTransaction(db, user.id, params.id);
    if (!existing) throw new HttpError(404, 'Không tìm thấy giao dịch');

    const goal = await db.transaction(async tx => {
      await tx.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', existing.id, user.id);
      if (!existing.goalId) return null;
      // Xoá một khoản nạp quỹ thì trừ lại số tiền trong quỹ tương ứng
      await tx.run('UPDATE goals SET current = MAX(0, current - ?) WHERE id = ? AND user_id = ?',
        existing.amount, existing.goalId, user.id);
      return (await getGoal(tx, user.id, existing.goalId)) ?? null;
    });
    return { ok: true, goal };
  });
}
