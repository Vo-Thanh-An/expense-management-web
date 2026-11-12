import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet, PieChart, Plus, Trash2, Search, Calendar, FileText,
  ArrowUpRight, ArrowDownRight, LogOut, User, BarChart3,
  LayoutDashboard, Lock, Mail, Sparkles, Download, RefreshCw,
  ArrowUp, ArrowDown, Minus, CheckCircle2, X, ShieldCheck,
  Target, CreditCard, Flame, AlertTriangle, ListFilter, Layers, Zap
} from 'lucide-react';

const CATEGORIES = {
  INCOME: [
    { id: 'Lương', label: 'Lương chính thức', color: 'from-emerald-500 to-teal-400', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: '💼' },
    { id: 'Thưởng', label: 'Thưởng & Bonus', color: 'from-cyan-500 to-blue-400', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: '🎁' },
    { id: 'Đầu tư', label: 'Lợi nhuận đầu tư', color: 'from-violet-500 to-purple-400', badge: 'text-violet-400 bg-violet-500/10 border-violet-500/30', icon: '📈' },
    { id: 'Khác_THU', label: 'Nguồn thu khác', color: 'from-sky-500 to-indigo-400', badge: 'text-sky-400 bg-sky-500/10 border-sky-500/30', icon: '💎' }
  ],
  EXPENSE: [
    { id: 'Ăn uống', label: 'Ăn uống & Cà phê', color: 'from-rose-500 to-orange-400', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: '🍜', budget: 4000000 },
    { id: 'Di chuyển', label: 'Di chuyển & Xăng xe', color: 'from-amber-500 to-yellow-400', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: '🏎️', budget: 1500000 },
    { id: 'Shopping', label: 'Mua sắm & Gear', color: 'from-fuchsia-500 to-pink-400', badge: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30', icon: '🛍️', budget: 3000000 },
    { id: 'Hóa đơn', label: 'Hóa đơn & Dịch vụ', color: 'from-indigo-500 to-blue-400', badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', icon: '⚡', budget: 2000000 },
    { id: 'Giải trí', label: 'Giải trí & Du lịch', color: 'from-purple-500 to-violet-400', badge: 'text-purple-400 bg-purple-500/10 border-purple-500/30', icon: '🎮', budget: 2500000 },
    { id: 'Sức khỏe', label: 'Sức khỏe & Gym', color: 'from-emerald-500 to-green-400', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: '🧬', budget: 1500000 },
    { id: 'Học tập', label: 'Học tập & Nâng cấp', color: 'from-cyan-500 to-teal-400', badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', icon: '🚀', budget: 2000000 }
  ]
};

const INITIAL_DATA = [
  { id: '101', amount: 18500000, type: 'INCOME', category: 'Lương', date: '2026-11-01', note: 'Lương tháng 11' },
  { id: '102', amount: 2800000, type: 'EXPENSE', category: 'Ăn uống', date: '2026-11-04', note: 'Ăn uống & Cà phê làm việc' },
  { id: '103', amount: 1350000, type: 'EXPENSE', category: 'Hóa đơn', date: '2026-11-06', note: 'Tiền điện, nước, cáp quang' },
  { id: '104', amount: 2600000, type: 'EXPENSE', category: 'Shopping', date: '2026-11-09', note: 'Nâng cấp bàn phím cơ & chuột' },
  { id: '105', amount: 750000, type: 'EXPENSE', category: 'Di chuyển', date: '2026-11-11', note: 'Đổ xăng & Grab di chuyển' },
  { id: '106', amount: 1200000, type: 'EXPENSE', category: 'Giải trí', date: '2026-11-12', note: 'Xem phim IMAX & ăn tối' },
  { id: '201', amount: 16500000, type: 'INCOME', category: 'Lương', date: '2026-10-01', note: 'Lương tháng 10' },
  { id: '202', amount: 3400000, type: 'EXPENSE', category: 'Ăn uống', date: '2026-10-08', note: 'Tiệc sinh nhật & ăn uống' },
  { id: '203', amount: 1200000, type: 'EXPENSE', category: 'Hóa đơn', date: '2026-10-10', note: 'Hóa đơn sinh hoạt' },
  { id: '204', amount: 2900000, type: 'EXPENSE', category: 'Giải trí', date: '2026-10-20', note: 'Du lịch Đà Lạt cuối tuần' }
];

const INITIAL_GOALS = [
  { id: 'g1', name: 'Quỹ Dự Phòng Khẩn Cấp', target: 30000000, current: 18500000, icon: '🛡️', color: 'from-emerald-500 to-cyan-400' },
  { id: 'g2', name: 'Nâng Cấp Setup PC / Laptop', target: 25000000, current: 11000000, icon: '💻', color: 'from-violet-500 to-fuchsia-400' },
  { id: 'g3', name: 'Du Lịch Xuyên Việt 2027', target: 15000000, current: 6500000, icon: '✈️', color: 'from-amber-500 to-rose-400' }
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cyber_expense_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('cyber_expense_tx');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('cyber_expense_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // 5 Trang điều hướng: 'overview' | 'ledger' | 'analytics' | 'budgets' | 'settings'
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE',
    category: 'Ăn uống',
    date: '2026-11-12',
    note: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    localStorage.setItem('cyber_expense_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cyber_expense_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    if (user) localStorage.setItem('cyber_expense_user', JSON.stringify(user));
    else localStorage.removeItem('cyber_expense_user');
  }, [user]);

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@gmail.com' && password === '123456') {
      setUser({ name: 'Võ Thanh An', email: 'admin@gmail.com', tier: 'COMMANDER PRO' });
      setLoginError('');
      showToast('Xác thực thành công! Đã mở khóa trung tâm tài chính.');
    } else {
      setLoginError('Truy cập bị từ chối! Vui lòng dùng tài khoản demo bên dưới.');
    }
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;

    const newTx = {
      ...formData,
      id: Date.now().toString(),
      amount: Number(formData.amount)
    };
    setTransactions(prev => [newTx, ...prev]);
    setFormData({ ...formData, amount: '', note: '' });
    setModalOpen(false);
    showToast(`Đã ghi nhận ${newTx.type === 'INCOME' ? 'khoản thu' : 'khoản chi'} ${formatVND(newTx.amount)}`);
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast('Đã xóa bản ghi khỏi sổ cái', 'delete');
  };

  const handleDepositGoal = (goalId, addAmount) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: Math.min(g.target, g.current + addAmount) } : g));
    showToast(`Đã nạp thêm ${formatVND(addAmount)} vào quỹ mục tiêu!`);
  };

  // Tổng quan toàn bộ tài sản
  const overallSummary = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;
    return { income, expense, balance, savingsRate };
  }, [transactions]);

  // Thống kê theo tháng & so sánh tháng trước
  const monthlyStats = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const currentTxs = transactions.filter(t => t.date.startsWith(selectedMonth));
    const prevTxs = transactions.filter(t => t.date.startsWith(prevMonthStr));

    const currIncome = currentTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const currExpense = currentTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    const prevIncome = prevTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const prevExpense = prevTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    const calcGrowth = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const expenseGrowth = calcGrowth(currExpense, prevExpense);
    const incomeGrowth = calcGrowth(currIncome, prevIncome);

    const catMap = {};
    currentTxs.filter(t => t.type === 'EXPENSE').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const breakdown = CATEGORIES.EXPENSE.map(cat => {
      const spent = catMap[cat.id] || 0;
      return {
        ...cat,
        spent,
        percentage: currExpense > 0 ? Math.round((spent / currExpense) * 100) : 0,
        budgetPct: Math.min(100, Math.round((spent / cat.budget) * 100)),
        isOverBudget: spent > cat.budget
      };
    }).sort((a, b) => b.spent - a.spent);

    return {
      prevMonthStr,
      currIncome, currExpense,
      prevIncome, prevExpense,
      expenseGrowth, incomeGrowth,
      breakdown
    };
  }, [transactions, selectedMonth]);

  // Lọc danh sách sổ giao dịch
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchType = filterType === 'ALL' || t.type === filterType;
        const matchCat = filterCategory === 'ALL' || t.category === filterCategory;
        const matchSearch = t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchCat && matchSearch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, filterCategory, searchTerm]);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Trung Tâm', icon: LayoutDashboard },
    { id: 'ledger', label: 'Sổ Giao Dịch', icon: Layers },
    { id: 'analytics', label: 'Phân Tích Tháng', icon: BarChart3 },
    { id: 'budgets', label: 'Hạn Mức & Quỹ', icon: Target },
    { id: 'settings', label: 'Hệ Thống', icon: User }
  ];

  // ==========================================
  // MÀN HÌNH ĐĂNG NHẬP CYBERPUNK
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ánh sáng nền */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="cyber-card max-w-md w-full rounded-3xl overflow-hidden animate-modal relative z-10">
          <div className="p-8 border-b border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px] mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent">
              FINTECH VAULT OS
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 tracking-wide">HỆ THỐNG QUẢN TRỊ TÀI CHÍNH CÁ NHÂN</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mã Định Danh (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Khóa Bảo Mật</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-cyber w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-500/25"
            >
              Khởi Động Hệ Thống
            </button>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Tài khoản truy cập nhanh:</span>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@gmail.com'); setPassword('123456'); }}
                  className="text-cyan-400 hover:underline font-bold"
                >
                  Nạp tự động
                </button>
              </div>
              <p>ID: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">admin@gmail.com</code></p>
              <p>Pass: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">123456</code></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN CHÍNH 5 TRANG (SIDEBAR + MAIN)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 font-sans flex flex-col lg:flex-row pb-20 lg:pb-0 relative overflow-x-hidden">
      {/* Hiệu ứng ánh sáng nền Ambient */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 right-6 z-50 animate-modal">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold tracking-wide backdrop-blur-xl ${
            toast.type === 'delete'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR TRÁI (DESKTOP) */}
      <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0b101d]/90 backdrop-blur-xl border-r border-slate-800/80 z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black tracking-wider text-base text-white">FINTECH VAULT</h1>
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">OS v2.6 • ONLINE</span>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Điều hướng hệ thống</p>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => setModalOpen(true)}
            className="btn-cyber w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Giao Dịch Mới
          </button>
        </div>
      </aside>

      {/* BOTTOM NAVIGATION BAR (MOBILE) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0b101d]/95 backdrop-blur-xl border-t border-slate-800 z-40 px-2 py-2 flex justify-around items-center">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
                active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="flex-1 lg:pl-68 flex flex-col min-h-screen relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#060911]/80 backdrop-blur-xl border-b border-slate-800/70 px-4 sm:px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {NAV_ITEMS.find(n => n.id === currentPage)?.label}
            </h2>
            <p className="text-xs text-slate-400">Tài khoản: <span className="text-emerald-400 font-semibold">{user.name}</span></p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="btn-cyber bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Thêm Thu / Chi</span>
          </button>
        </header>

        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* ========================================================== */}
          {/* TRANG 1: TRUNG TÂM ĐIỀU KHIỂN (COMMAND CENTER)             */}
          {/* ========================================================== */}
          {currentPage === 'overview' && (
            <div key="overview" className="space-y-6 animate-page">
              {/* Hàng 1: Thẻ ATM Virtual 3D + 3 Chỉ số cốt lõi */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Virtual Card 3D phát sáng */}
                <div className="card-shimmer relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-cyan-950 border border-emerald-500/40 shadow-2xl flex flex-col justify-between min-h-[210px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300/80">Tổng Tài Sản Khả Dụng</span>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums tracking-tight">
                        {formatVND(overallSummary.balance)}
                      </div>
                    </div>
                    <CreditCard className="w-8 h-8 text-emerald-400/80" />
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Chủ thẻ</p>
                      <p className="text-sm font-bold text-white tracking-wider uppercase mt-0.5">{user.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-black text-emerald-300">
                        TỶ LỆ TÍCH LŨY: {overallSummary.savingsRate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Thu nhập, Chi tiêu & Trạng thái tháng */}
                <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="cyber-card p-6 rounded-3xl flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Dòng Tiền Vào</span>
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="my-3">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
                        +{formatVND(overallSummary.income)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Dữ liệu đồng bộ tự động trên trình duyệt</p>
                  </div>

                  <div className="cyber-card p-6 rounded-3xl flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Dòng Tiền Ra</span>
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <ArrowDownRight className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="my-3">
                      <div className="text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">
                        -{formatVND(overallSummary.expense)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Kiểm soát chi tiêu thông minh</p>
                  </div>
                </div>
              </div>

              {/* Hàng 2: Top Danh Mục Chi Tiêu + Giao Dịch Gần Nhất */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Top Danh Mục */}
                <div className="lg:col-span-2 cyber-card p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-amber-400" /> Tiêu Điểm Chi Tiêu ({selectedMonth})
                    </h3>
                    <button onClick={() => setCurrentPage('analytics')} className="text-xs text-cyan-400 hover:underline font-bold">
                      Chi tiết →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {monthlyStats.breakdown.slice(0, 4).map(cat => (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">{cat.icon} {cat.label}</span>
                          <span className="text-white tabular-nums">{formatVND(cat.spent)}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 Giao dịch gần nhất */}
                <div className="lg:col-span-3 cyber-card rounded-3xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Giao Dịch Gần Nhất</h3>
                    <button onClick={() => setCurrentPage('ledger')} className="text-xs text-emerald-400 hover:underline font-bold">
                      Xem toàn bộ sổ cái →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {transactions.slice(0, 5).map(t => {
                      const isInc = t.type === 'INCOME';
                      const catObj = (isInc ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).find(c => c.id === t.category) || { icon: '📌', label: t.category };
                      return (
                        <div key={t.id} className="p-4 px-6 hover:bg-slate-800/40 transition flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg">
                              {catObj.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-100">{t.note || catObj.label}</h4>
                              <p className="text-xs text-slate-400">{t.category} • {t.date}</p>
                            </div>
                          </div>
                          <span className={`font-black text-sm tabular-nums ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isInc ? '+' : '-'}{formatVND(t.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TRANG 2: SỔ GIAO DỊCH TOÀN DIỆN (LEDGER)                    */}
          {/* ========================================================== */}
          {currentPage === 'ledger' && (
            <div key="ledger" className="space-y-6 animate-page">
              {/* Thanh công cụ lọc nâng cao */}
              <div className="cyber-card p-4 rounded-2xl flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm nội dung giao dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Tất cả danh mục</option>
                  {[...CATEGORIES.EXPENSE, ...CATEGORIES.INCOME].map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>

                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                  {['ALL', 'EXPENSE', 'INCOME'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3.5 py-1.5 rounded-lg transition ${
                        filterType === type ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'ALL' ? 'Tất cả' : type === 'EXPENSE' ? 'Khoản Chi' : 'Khoản Thu'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bảng danh sách giao dịch */}
              <div className="cyber-card rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-emerald-400" /> Sổ Cái Chi Tiết
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    {filteredTransactions.length} bản ghi
                  </span>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Không tìm thấy giao dịch nào khớp bộ lọc</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/70">
                    {filteredTransactions.map(t => {
                      const isInc = t.type === 'INCOME';
                      const catObj = (isInc ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).find(c => c.id === t.category) || { icon: '📌', label: t.category, badge: 'text-slate-400 bg-slate-800' };
                      return (
                        <div key={t.id} className="p-4 sm:px-6 hover:bg-slate-800/40 transition flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
                              {catObj.icon}
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-sm text-white">{t.note || catObj.label}</h4>
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${catObj.badge}`}>
                                  {t.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(t.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`font-black text-sm sm:text-base tabular-nums ${isInc ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isInc ? '+' : '-'}{formatVND(t.amount)}
                            </span>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition active:scale-90"
                              title="Xóa bản ghi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TRANG 3: PHÂN TÍCH THÁNG & SO SÁNH THÁNG TRƯỚC             */}
          {/* ========================================================== */}
          {currentPage === 'analytics' && (
            <div key="analytics" className="space-y-6 animate-page">
              <div className="cyber-card p-6 rounded-3xl flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Phân Tích Biến Động Tài Chính</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đối chiếu trực tiếp dữ liệu tháng <strong className="text-emerald-400">{selectedMonth}</strong> với tháng trước (<strong className="text-slate-200">{monthlyStats.prevMonthStr}</strong>)
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-400">Kỳ báo cáo:</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent text-sm font-black text-emerald-400 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* So sánh 2 chỉ số Chi tiêu & Thu nhập */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="cyber-card p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Chi Tháng {selectedMonth}</span>
                      <div className="text-3xl font-black text-rose-400 mt-1 tabular-nums">{formatVND(monthlyStats.currExpense)}</div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
                      monthlyStats.expenseGrowth > 0
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : monthlyStats.expenseGrowth < 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {monthlyStats.expenseGrowth > 0 ? <ArrowUp className="w-3.5 h-3.5" /> :
                       monthlyStats.expenseGrowth < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {Math.abs(monthlyStats.expenseGrowth)}% vs tháng trước
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
                    <span>Tháng trước ({monthlyStats.prevMonthStr}):</span>
                    <span className="font-bold text-slate-200 tabular-nums">{formatVND(monthlyStats.prevExpense)}</span>
                  </div>
                </div>

                <div className="cyber-card p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thu Tháng {selectedMonth}</span>
                      <div className="text-3xl font-black text-emerald-400 mt-1 tabular-nums">{formatVND(monthlyStats.currIncome)}</div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
                      monthlyStats.incomeGrowth >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {monthlyStats.incomeGrowth > 0 ? <ArrowUp className="w-3.5 h-3.5" /> :
                       monthlyStats.incomeGrowth < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {Math.abs(monthlyStats.incomeGrowth)}% vs tháng trước
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
                    <span>Tháng trước ({monthlyStats.prevMonthStr}):</span>
                    <span className="font-bold text-slate-200 tabular-nums">{formatVND(monthlyStats.prevIncome)}</span>
                  </div>
                </div>
              </div>

              {/* Biểu đồ thanh tỷ trọng danh mục */}
              <div className="cyber-card p-6 rounded-3xl">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <PieChart className="w-5 h-5 text-cyan-400" /> Phân Bổ Tỷ Trọng Chi Tiêu Tháng {selectedMonth}
                </h3>
                <div className="space-y-5">
                  {monthlyStats.breakdown.filter(b => b.spent > 0).length === 0 ? (
                    <p className="text-center py-8 text-slate-500 text-sm">Chưa có dữ liệu chi tiêu trong tháng này.</p>
                  ) : (
                    monthlyStats.breakdown.filter(b => b.spent > 0).map(cat => (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-200 flex items-center gap-2">
                            <span className="text-base">{cat.icon}</span> {cat.label}
                          </span>
                          <span className="text-white tabular-nums">
                            {formatVND(cat.spent)} <span className="text-emerald-400 ml-1">({cat.percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                          <div
                            className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TRANG 4: HẠN MỨC CHI TIÊU & QUỸ MỤC TIÊU (BUDGETS & VAULTS) */}
          {/* ========================================================== */}
          {currentPage === 'budgets' && (
            <div key="budgets" className="space-y-8 animate-page">
              {/* Phần 1: Quỹ Tiết Kiệm Mục Tiêu */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Các Quỹ Tích Lũy Mục Tiêu (Vaults)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {goals.map(g => {
                    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
                    return (
                      <div key={g.id} className="cyber-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
                            {g.icon}
                          </div>
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400">
                            {pct}%
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-base">{g.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 tabular-nums">
                            Đã đạt: <strong className="text-white">{formatVND(g.current)}</strong> / {formatVND(g.target)}
                          </p>
                        </div>

                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full bg-gradient-to-r ${g.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>

                        <button
                          onClick={() => handleDepositGoal(g.id, 1000000)}
                          className="btn-cyber w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-black text-emerald-400 border border-slate-700 transition"
                        >
                          + Nạp Nhanh 1.000.000 ₫
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phần 2: Kiểm Soát Hạn Mức Chi Tiêu Tháng */}
              <div className="cyber-card p-6 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-black text-white">Hạn Mức Chi Tiêu Danh Mục ({selectedMonth})</h3>
                    <p className="text-xs text-slate-400">Hệ thống tự động cảnh báo khi mức chi chạm ngưỡng giới hạn</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {monthlyStats.breakdown.map(cat => (
                    <div key={cat.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                        {cat.isOverBudget ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vượt hạn mức!
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{cat.budgetPct}% hạn mức</span>
                        )}
                      </div>

                      <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            cat.isOverBudget ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : `bg-gradient-to-r ${cat.color}`
                          }`}
                          style={{ width: `${cat.budgetPct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
                        <span>Đã chi: <strong className={cat.isOverBudget ? 'text-rose-400' : 'text-white'}>{formatVND(cat.spent)}</strong></span>
                        <span>Giới hạn: {formatVND(cat.budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* TRANG 5: HỆ THỐNG & HỒ SƠ (SETTINGS)                       */}
          {/* ========================================================== */}
          {currentPage === 'settings' && (
            <div key="settings" className="max-w-2xl mx-auto cyber-card rounded-3xl overflow-hidden animate-page">
              <div className="p-8 bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-slate-800 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {user.tier}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">{user.name}</h3>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Xuất Dữ Liệu Sao Lưu (JSON)</h4>
                    <p className="text-xs text-slate-400">Tải toàn bộ lịch sử giao dịch về máy tính cá nhân</p>
                  </div>
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
                      const a = document.createElement('a');
                      a.href = dataStr;
                      a.download = `fintech-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      showToast('Đã xuất file sao lưu thành công!');
                    }}
                    className="btn-cyber px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Tải JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">Reset Dữ Liệu Hệ Thống</h4>
                    <p className="text-xs text-slate-400">Khôi phục lại toàn bộ dữ liệu mẫu ban đầu</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu?')) {
                        setTransactions(INITIAL_DATA);
                        setGoals(INITIAL_GOALS);
                        showToast('Đã khôi phục dữ liệu gốc!');
                      }
                    }}
                    className="btn-cyber px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Khôi Phục
                  </button>
                </div>

                <button
                  onClick={() => setUser(null)}
                  className="btn-cyber w-full py-3.5 mt-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Ngắt Kết Nối & Đăng Xuất
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL THÊM GIAO DỊCH MỚI */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="cyber-card max-w-md w-full rounded-3xl overflow-hidden border-emerald-500/40 animate-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
              <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Ghi Nhận Giao Dịch Mới
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4 bg-[#0b101d]">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: CATEGORIES.EXPENSE[0].id })}
                  className={`py-2.5 rounded-lg transition ${
                    formData.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  KHOẢN CHI (-)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'INCOME', category: CATEGORIES.INCOME[0].id })}
                  className={`py-2.5 rounded-lg transition ${
                    formData.type === 'INCOME' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  KHOẢN THU (+)
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Số Tiền Giao Dịch (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full text-xl font-black px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tabular-nums focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Phân Loại Danh Mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {(formData.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Ngày Thực Hiện</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Ghi Chú Chi Tiết</label>
                <input
                  type="text"
                  placeholder="VD: Đổ xăng, Mua sách lập trình..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className={`btn-cyber w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg ${
                  formData.type === 'INCOME'
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
                    : 'bg-rose-500 text-white shadow-rose-500/25'
                }`}
              >
                Xác Nhận Lưu Vào Hệ Thống
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}