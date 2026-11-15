import { useState } from 'react';
import { Target, Plus, Trash2, Loader2, AlertTriangle, Pencil, Save, X } from 'lucide-react';
import { formatVND } from '../utils/format';

const DEFAULT_DEPOSIT = 1000000;

export default function BudgetsPage({ goals, monthlyStats, selectedMonth, actions, onCreateGoal }) {
  const [depositInputs, setDepositInputs] = useState({}); // { [goalId]: số tiền đang nhập }
  const [busyGoalId, setBusyGoalId] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null); // { category, value }

  const handleDepositGoal = async (goalId, value) => {
    const amount = Number(value);
    if (!Number.isInteger(amount) || amount <= 0) return;
    setBusyGoalId(goalId);
    await actions.depositGoal(goalId, amount);
    setBusyGoalId(null);
  };

  const handleDeleteGoal = (goal) => {
    if (window.confirm(`Xoá quỹ "${goal.name}"? Các khoản đã nạp qua ứng dụng sẽ được hoàn về số dư khả dụng.`)) {
      actions.deleteGoal(goal);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!editingBudget) return;
    if (await actions.updateBudget(editingBudget.category, Number(editingBudget.value) || 0)) setEditingBudget(null);
  };

  return (
    <div className="space-y-8 animate-page">
      <div>
        <div className="flex justify-between items-center mb-4 gap-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-700 flex items-center gap-2">
            <Target className="w-4 h-4" /> Các Quỹ Tích Lũy Mục Tiêu (Vaults)
          </h3>
          <button
            onClick={onCreateGoal}
            className="btn-cyber px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Tạo Quỹ
          </button>
        </div>
        {goals.length === 0 && (
          <div className="light-card p-8 rounded-3xl text-center text-slate-400 text-sm">Chưa có quỹ nào. Tạo quỹ đầu tiên để bắt đầu tích luỹ.</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} className="light-card p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                    {g.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {pct}%
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xoá quỹ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{g.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 tabular-nums">
                    Đã đạt: <strong className="text-slate-900">{formatVND(g.current)}</strong> / {formatVND(g.target)}
                  </p>
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${g.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>

                {g.current >= g.target ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black text-center">
                    🎉 Đã đạt mục tiêu!
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleDepositGoal(g.id, depositInputs[g.id] ?? DEFAULT_DEPOSIT); }}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      min="1000"
                      step="1000"
                      value={depositInputs[g.id] ?? DEFAULT_DEPOSIT}
                      onChange={(e) => setDepositInputs(prev => ({ ...prev, [g.id]: e.target.value }))}
                      className="min-w-0 flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-none focus:border-emerald-500"
                      aria-label="Số tiền nạp"
                    />
                    <button
                      type="submit"
                      disabled={busyGoalId === g.id}
                      className="btn-cyber px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-xs font-black text-emerald-700 border border-emerald-200 transition disabled:opacity-60"
                    >
                      {busyGoalId === g.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '+ Nạp'}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="light-card p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-black text-slate-900">Hạn Mức Chi Tiêu Danh Mục ({selectedMonth})</h3>
            <p className="text-xs text-slate-500">Hệ thống tự động cảnh báo khi mức chi chạm ngưỡng giới hạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {monthlyStats.breakdown.filter(cat => !cat.isSaving).map(cat => (
            <div key={cat.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.label}
                </span>
                {cat.isOverBudget ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Vượt hạn mức!
                  </span>
                ) : cat.budget > 0 ? (
                  <span className="text-xs font-bold text-slate-500">{cat.budgetPct}% hạn mức</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Chưa đặt hạn mức</span>
                )}
              </div>

              <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    cat.isOverBudget ? 'bg-rose-500' : `bg-gradient-to-r ${cat.color}`
                  }`}
                  style={{ width: `${cat.budgetPct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
                <span>Đã chi: <strong className={cat.isOverBudget ? 'text-rose-600' : 'text-slate-900'}>{formatVND(cat.spent)}</strong></span>
                {editingBudget?.category === cat.id ? (
                  <form onSubmit={handleSaveBudget} className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      step="100000"
                      autoFocus
                      value={editingBudget.value}
                      onChange={(e) => setEditingBudget({ category: cat.id, value: e.target.value })}
                      className="w-28 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-900 focus:outline-none"
                      aria-label="Hạn mức mới"
                    />
                    <button type="submit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Lưu"><Save className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => setEditingBudget(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded" title="Huỷ"><X className="w-3.5 h-3.5" /></button>
                  </form>
                ) : (
                  <button
                    onClick={() => setEditingBudget({ category: cat.id, value: String(cat.budget) })}
                    className="flex items-center gap-1 hover:text-emerald-700 transition"
                    title="Sửa hạn mức"
                  >
                    Giới hạn: {formatVND(cat.budget)} <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
