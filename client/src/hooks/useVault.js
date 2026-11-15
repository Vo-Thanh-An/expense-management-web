import { useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from '../api/client';
import { sortTransactions } from '../utils/finance';
import { formatVND } from '../utils/format';

/**
 * Quản lý phiên đăng nhập và toàn bộ dữ liệu của người dùng (giao dịch, quỹ, hạn mức).
 * Mọi thay đổi đều gọi API trước rồi mới cập nhật state.
 * Các action trả về kết quả khi thành công, `null` khi lỗi (lỗi đã được hiện bằng toast).
 */
export function useVault({ showToast, showError }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(() => Boolean(getToken()));
  const [notice, setNotice] = useState(''); // thông báo hiện ở màn hình đăng nhập
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState({});

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setTransactions([]);
    setGoals([]);
    setBudgets({});
  }, []);

  const applyBootstrap = useCallback(data => {
    setUser(data.user);
    setTransactions(sortTransactions(data.transactions));
    setGoals(data.goals);
    setBudgets(data.budgets);
  }, []);

  // Token hết hạn ở bất kỳ request nào → quay về màn hình đăng nhập
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setNotice('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    });
  }, [clearSession]);

  // Mở app khi đã có token → tải dữ liệu từ server
  useEffect(() => {
    if (!getToken()) return;
    api.bootstrap()
      .then(applyBootstrap)
      .catch(err => { if (err.status !== 401) setNotice(err.message); })
      .finally(() => setBooting(false));
  }, [applyBootstrap]);

  /** Chạy một lời gọi API; lỗi thì hiện toast và trả về null */
  const attempt = useCallback(async fn => {
    try {
      return await fn();
    } catch (err) {
      showError(err);
      return null;
    }
  }, [showError]);

  // ---------- Xác thực (ném lỗi để màn hình đăng nhập tự hiển thị) ----------
  const authenticate = async (mode, { name, email, password }) => {
    setNotice('');
    const res = mode === 'register' ? await api.register(name, email, password) : await api.login(email, password);
    setToken(res.token);
    try {
      applyBootstrap(await api.bootstrap());
    } catch (err) {
      setToken(null);
      throw err;
    }
    showToast(mode === 'register' ? 'Tạo tài khoản thành công! Chào mừng bạn.' : 'Đăng nhập thành công! Chào mừng trở lại.');
  };

  const logout = async () => {
    try { await api.logout(); } catch { /* token có thể đã hết hạn, bỏ qua */ }
    clearSession();
    showToast('Đã đăng xuất', 'delete');
  };

  const updateProfile = name => attempt(async () => {
    const res = await api.updateProfile(name);
    setUser(res.user);
    showToast('Đã cập nhật hồ sơ');
    return res.user;
  });

  const changePassword = (current, next) => attempt(async () => {
    await api.changePassword(current, next);
    showToast('Đã đổi mật khẩu');
    return true;
  });

  // ---------- Giao dịch ----------
  const saveTransaction = (id, payload) => attempt(async () => {
    if (id) {
      const updated = await api.updateTransaction(id, payload);
      setTransactions(prev => sortTransactions(prev.map(t => (t.id === updated.id ? updated : t))));
      showToast('Đã cập nhật giao dịch');
      return updated;
    }
    const created = await api.createTransaction(payload);
    setTransactions(prev => sortTransactions([created, ...prev]));
    showToast(`Đã ghi nhận ${created.type === 'INCOME' ? 'khoản thu' : 'khoản chi'} ${formatVND(created.amount)}`);
    return created;
  });

  const deleteTransaction = id => attempt(async () => {
    const res = await api.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (res.goal) setGoals(prev => prev.map(g => (g.id === res.goal.id ? res.goal : g)));
    showToast('Đã xóa giao dịch khỏi danh sách', 'delete');
    return true;
  });

  // ---------- Quỹ mục tiêu ----------
  const createGoal = goal => attempt(async () => {
    const created = await api.createGoal(goal);
    setGoals(prev => [...prev, created]);
    showToast(`Đã tạo quỹ "${created.name}"`);
    return created;
  });

  const deleteGoal = goal => attempt(async () => {
    const res = await api.deleteGoal(goal.id);
    const removed = new Set(res.removedTransactionIds);
    setGoals(prev => prev.filter(g => g.id !== goal.id));
    setTransactions(prev => prev.filter(t => !removed.has(t.id)));
    showToast(`Đã xoá quỹ "${goal.name}"`, 'delete');
    return true;
  });

  // Server kiểm tra số dư, chỉ nạp phần còn thiếu và tự tạo khoản "Trích quỹ" trong sổ giao dịch
  const depositGoal = (goalId, amount) => attempt(async () => {
    const res = await api.depositGoal(goalId, amount);
    setGoals(prev => prev.map(g => (g.id === goalId ? res.goal : g)));
    setTransactions(prev => sortTransactions([res.transaction, ...prev]));
    showToast(`Đã trích ${formatVND(res.deposited)} vào "${res.goal.name}"!`);
    return res;
  });

  // ---------- Hạn mức & hệ thống ----------
  const updateBudget = (category, amount) => attempt(async () => {
    setBudgets(await api.updateBudget(category, amount));
    showToast('Đã cập nhật hạn mức');
    return true;
  });

  const resetDemo = () => attempt(async () => {
    await api.resetDemo();
    applyBootstrap(await api.bootstrap());
    showToast('Đã khôi phục dữ liệu gốc!');
    return true;
  });

  return {
    user, booting, notice,
    transactions, goals, budgets,
    actions: {
      authenticate, logout, updateProfile, changePassword,
      saveTransaction, deleteTransaction,
      createGoal, deleteGoal, depositGoal,
      updateBudget, resetDemo
    }
  };
}
