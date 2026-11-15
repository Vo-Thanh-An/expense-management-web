import { HttpError } from '../lib/http.js';
import { MAX_AMOUNT } from '../lib/validation.js';
import { getBudgets } from '../db/queries.js';
import { CATEGORIES } from '../../../shared/categories.js';

export function registerBudgetRoutes(router, { db }) {
  router.get('/api/budgets', ({ user }) => getBudgets(db, user.id));

  router.put('/api/budgets/:category', async ({ user, params, body }) => {
    const cat = CATEGORIES.EXPENSE.find(c => c.id === params.category);
    if (!cat || cat.isSaving) throw new HttpError(400, 'Danh mục không có hạn mức');

    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 0 || amount > MAX_AMOUNT) {
      throw new HttpError(400, 'Hạn mức phải là số nguyên không âm');
    }
    await db.run(`
      INSERT INTO budgets (user_id, category, amount) VALUES (?, ?, ?)
      ON CONFLICT(user_id, category) DO UPDATE SET amount = excluded.amount
    `, user.id, cat.id, amount);
    return getBudgets(db, user.id);
  });
}
