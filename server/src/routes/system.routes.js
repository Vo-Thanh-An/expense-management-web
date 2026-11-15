import { seedDemoData } from '../db/seed.js';
import { publicUser, listTransactions, listGoals, getBudgets } from '../db/queries.js';

export function registerSystemRoutes(router, { db }) {
  router.get('/api/health', async () => {
    await db.get('SELECT 1 AS ok'); // kiểm tra kết nối database
    return { ok: true, database: db.kind };
  }, { auth: false });

  // Toàn bộ dữ liệu của user trong một lần gọi (dùng khi mở app)
  router.get('/api/bootstrap', async ({ user }) => {
    const [transactions, goals, budgets] = await Promise.all([
      listTransactions(db, user.id),
      listGoals(db, user.id),
      getBudgets(db, user.id)
    ]);
    return { user: publicUser(user), transactions, goals, budgets };
  });

  // Xoá dữ liệu hiện tại và nạp lại dữ liệu mẫu
  router.post('/api/demo/reset', async ({ user }) => {
    await seedDemoData(db, user.id);
    return { ok: true };
  });
}
