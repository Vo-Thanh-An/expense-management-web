import { CATEGORIES } from '@shared/categories';
import { previousMonthStr } from './format';

/** Sắp xếp giao dịch: mới nhất trước (cùng ngày thì id lớn trước) */
export const sortTransactions = list =>
  [...list].sort((a, b) => (b.date === a.date ? b.id - a.id : b.date < a.date ? -1 : 1));

const FALLBACK_BADGE = 'text-slate-600 bg-slate-100 border-slate-200';

/** Thông tin hiển thị (icon, nhãn, màu) của danh mục một giao dịch */
export const getCategoryMeta = (type, id) =>
  (type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).find(c => c.id === id)
  || { icon: '📌', label: id, badge: FALLBACK_BADGE };

const sum = (list, type) => list.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

/** Tổng thu, tổng chi, số dư và tỷ lệ tích luỹ trên toàn bộ giao dịch */
export function computeSummary(transactions) {
  const income = sum(transactions, 'INCOME');
  const expense = sum(transactions, 'EXPENSE');
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;
  return { income, expense, balance, savingsRate };
}

const growth = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

/** Thống kê một tháng, so sánh với tháng trước và phân bổ theo danh mục/hạn mức */
export function computeMonthlyStats(transactions, month, budgets) {
  const prevMonthStr = previousMonthStr(month);
  const currentTxs = transactions.filter(t => t.date.startsWith(month));
  const prevTxs = transactions.filter(t => t.date.startsWith(prevMonthStr));

  const currIncome = sum(currentTxs, 'INCOME');
  const currExpense = sum(currentTxs, 'EXPENSE');
  const prevIncome = sum(prevTxs, 'INCOME');
  const prevExpense = sum(prevTxs, 'EXPENSE');

  const spentByCategory = {};
  currentTxs.filter(t => t.type === 'EXPENSE').forEach(t => {
    spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
  });

  const breakdown = CATEGORIES.EXPENSE.map(cat => {
    const spent = spentByCategory[cat.id] || 0;
    const budget = budgets[cat.id] ?? 0;
    return {
      ...cat,
      budget,
      spent,
      percentage: currExpense > 0 ? Math.round((spent / currExpense) * 100) : 0,
      budgetPct: budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0,
      isOverBudget: budget > 0 && spent > budget
    };
  }).sort((a, b) => b.spent - a.spent);

  return {
    prevMonthStr,
    currIncome, currExpense,
    prevIncome, prevExpense,
    expenseGrowth: growth(currExpense, prevExpense),
    incomeGrowth: growth(currIncome, prevIncome),
    breakdown
  };
}
