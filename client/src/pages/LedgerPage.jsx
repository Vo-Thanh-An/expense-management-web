import { useState, useMemo } from 'react';
import { Search, Calendar, FileText, ListFilter, Pencil, Trash2 } from 'lucide-react';
import { CATEGORIES } from '@shared/categories';
import { formatVND } from '../utils/format';
import { getCategoryMeta } from '../utils/finance';

export default function LedgerPage({ transactions, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return transactions.filter(t => {
      const matchType = filterType === 'ALL' || t.type === filterType;
      const matchCat = filterCategory === 'ALL' || t.category === filterCategory;
      const matchSearch = !q || t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchType && matchCat && matchSearch;
    });
  }, [transactions, filterType, filterCategory, searchTerm]);

  return (
    <div className="space-y-6 animate-page">
      <div className="light-card p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung giao dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">Tất cả danh mục</option>
          {[...CATEGORIES.EXPENSE, ...CATEGORIES.INCOME].map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
          ))}
        </select>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['ALL', 'EXPENSE', 'INCOME'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                filterType === type ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type === 'EXPENSE' ? 'Khoản Chi' : 'Khoản Thu'}
            </button>
          ))}
        </div>
      </div>

      <div className="light-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-emerald-600" /> Sổ Cái Chi Tiết
          </span>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {filteredTransactions.length} bản ghi
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Không tìm thấy giao dịch nào khớp bộ lọc</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map(t => {
              const isInc = t.type === 'INCOME';
              const catObj = getCategoryMeta(t.type, t.category);
              return (
                <div key={t.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${isInc ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {catObj.icon}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{t.note || catObj.label}</h4>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${catObj.badge}`}>
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(t.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={`font-black text-sm sm:text-base mr-2 tabular-nums ${isInc ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isInc ? '+' : '-'}{formatVND(t.amount)}
                    </span>
                    {!t.goalId && (
                      <button
                        onClick={() => onEdit(t)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition active:scale-90"
                        title="Sửa bản ghi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-90"
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
  );
}
