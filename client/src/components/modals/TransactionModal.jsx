import { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { CATEGORIES } from '@shared/categories';
import { todayStr } from '../../utils/format';

const emptyForm = () => ({ amount: '', type: 'EXPENSE', category: CATEGORIES.EXPENSE[0].id, date: todayStr(), note: '' });

/** Thêm mới (editing = null) hoặc chỉnh sửa một giao dịch. onSave(payload) trả về null nếu lỗi. */
export default function TransactionModal({ editing, onClose, onSave }) {
  const [formData, setFormData] = useState(() => (
    editing
      ? { amount: String(editing.amount), type: editing.type, category: editing.category, date: editing.date, note: editing.note }
      : emptyForm()
  ));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(formData.amount);
    if (!Number.isInteger(amount) || amount <= 0) return;
    setSaving(true);
    const ok = await onSave({ ...formData, amount });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal title={editing ? 'Chỉnh Sửa Giao Dịch' : 'Ghi Nhận Giao Dịch Mới'} icon={Zap} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-black">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'EXPENSE', category: CATEGORIES.EXPENSE[0].id })}
            className={`py-2.5 rounded-lg transition ${
              formData.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            KHOẢN CHI (-)
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'INCOME', category: CATEGORIES.INCOME[0].id })}
            className={`py-2.5 rounded-lg transition ${
              formData.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            KHOẢN THU (+)
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Số Tiền Giao Dịch (VNĐ)</label>
          <input
            type="number"
            required
            min="1000"
            step="1000"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full text-xl font-black px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tabular-nums focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Phân Loại Danh Mục</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
          >
            {(formData.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).filter(cat => !cat.isSaving).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Ngày Thực Hiện</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Ghi Chú Chi Tiết</label>
          <input
            type="text"
            placeholder="VD: Đổ xăng, Mua sách lập trình..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`btn-cyber w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs text-white shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 ${
            formData.type === 'INCOME'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
          }`}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {editing ? 'Lưu Thay Đổi' : 'Xác Nhận Lưu Vào Hệ Thống'}
        </button>
      </form>
    </Modal>
  );
}
