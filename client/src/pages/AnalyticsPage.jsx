import { ArrowUp, ArrowDown, Minus, PieChart } from 'lucide-react';
import { formatVND } from '../utils/format';

export default function AnalyticsPage({ selectedMonth, onMonthChange, monthlyStats }) {
  return (
    <div className="space-y-6 animate-page">
      <div className="light-card p-6 rounded-3xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Phân Tích Biến Động Tài Chính</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối chiếu trực tiếp dữ liệu tháng <strong className="text-emerald-600">{selectedMonth}</strong> với tháng trước (<strong className="text-slate-700">{monthlyStats.prevMonthStr}</strong>)
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500">Kỳ báo cáo:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-transparent text-sm font-black text-emerald-700 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="light-card p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Chi Tháng {selectedMonth}</span>
              <div className="text-3xl font-black text-rose-600 mt-1 tabular-nums">{formatVND(monthlyStats.currExpense)}</div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
              monthlyStats.expenseGrowth > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : monthlyStats.expenseGrowth < 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {monthlyStats.expenseGrowth > 0 ? <ArrowUp className="w-3.5 h-3.5" /> :
               monthlyStats.expenseGrowth < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {Math.abs(monthlyStats.expenseGrowth)}% vs tháng trước
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Tháng trước ({monthlyStats.prevMonthStr}):</span>
            <span className="font-bold text-slate-800 tabular-nums">{formatVND(monthlyStats.prevExpense)}</span>
          </div>
        </div>

        <div className="light-card p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Thu Tháng {selectedMonth}</span>
              <div className="text-3xl font-black text-emerald-600 mt-1 tabular-nums">{formatVND(monthlyStats.currIncome)}</div>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border ${
              monthlyStats.incomeGrowth >= 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              {monthlyStats.incomeGrowth > 0 ? <ArrowUp className="w-3.5 h-3.5" /> :
               monthlyStats.incomeGrowth < 0 ? <ArrowDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {Math.abs(monthlyStats.incomeGrowth)}% vs tháng trước
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Tháng trước ({monthlyStats.prevMonthStr}):</span>
            <span className="font-bold text-slate-800 tabular-nums">{formatVND(monthlyStats.prevIncome)}</span>
          </div>
        </div>
      </div>

      <div className="light-card p-6 rounded-3xl">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
          <PieChart className="w-5 h-5 text-emerald-600" /> Phân Bổ Tỷ Trọng Chi Tiêu Tháng {selectedMonth}
        </h3>
        <div className="space-y-5">
          {monthlyStats.breakdown.filter(b => b.spent > 0).length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">Chưa có dữ liệu chi tiêu trong tháng này.</p>
          ) : (
            monthlyStats.breakdown.filter(b => b.spent > 0).map(cat => (
              <div key={cat.id} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span> {cat.label}
                  </span>
                  <span className="text-slate-900 tabular-nums">
                    {formatVND(cat.spent)} <span className="text-emerald-600 ml-1">({cat.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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
  );
}
