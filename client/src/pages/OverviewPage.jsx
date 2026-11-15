import { ArrowUpRight, ArrowDownRight, CreditCard, Flame } from 'lucide-react';
import { formatVND } from '../utils/format';
import { getCategoryMeta } from '../utils/finance';

export default function OverviewPage({ user, summary, monthlyStats, selectedMonth, transactions, onNavigate }) {
  return (
    <div className="space-y-6 animate-page">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Virtual Card 3D Nổi Bật */}
        <div className="card-shimmer relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-600/20 flex flex-col justify-between min-h-[210px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Tổng Tài Sản Khả Dụng</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums tracking-tight">
                {formatVND(summary.balance)}
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-white/80" />
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-emerald-100 uppercase tracking-widest">Chủ thẻ</p>
              <p className="text-sm font-bold text-white tracking-wider uppercase mt-0.5">{user.name}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-black text-white">
                TÍCH LŨY: {summary.savingsRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: Thu nhập & Chi tiêu */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="light-card p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Dòng Tiền Vào</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 tabular-nums">
                +{formatVND(summary.income)}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Đồng bộ an toàn trên máy chủ</p>
          </div>

          <div className="light-card p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Dòng Tiền Ra</span>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
                -{formatVND(summary.expense)}
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">Kiểm soát chi tiêu thông minh</p>
          </div>
        </div>
      </div>

      {/* Hàng 2: Top Danh Mục + Giao Dịch Gần Nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 light-card p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500" /> Tiêu Điểm Chi Tiêu ({selectedMonth})
            </h3>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-emerald-600 hover:underline font-bold">
              Chi tiết →
            </button>
          </div>
          <div className="space-y-4">
            {monthlyStats.breakdown.slice(0, 4).map(cat => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{cat.icon} {cat.label}</span>
                  <span className="text-slate-900 tabular-nums">{formatVND(cat.spent)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 light-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Giao Dịch Gần Nhất</h3>
            <button onClick={() => onNavigate('ledger')} className="text-xs text-emerald-600 hover:underline font-bold">
              Xem toàn bộ sổ cái →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-sm">Chưa có giao dịch nào. Bấm "Thêm Thu / Chi" để bắt đầu.</p>
            )}
            {transactions.slice(0, 5).map(t => {
              const isInc = t.type === 'INCOME';
              const catObj = getCategoryMeta(t.type, t.category);
              return (
                <div key={t.id} className="p-4 px-6 hover:bg-slate-50 transition flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isInc ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {catObj.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.note || catObj.label}</h4>
                      <p className="text-xs text-slate-400">{t.category} • {t.date}</p>
                    </div>
                  </div>
                  <span className={`font-black text-sm tabular-nums ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isInc ? '+' : '-'}{formatVND(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
