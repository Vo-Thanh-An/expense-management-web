import { useState } from 'react';
import { Target, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { GOAL_ICONS, GOAL_COLORS } from '@shared/categories';

const emptyGoalForm = () => ({ name: '', target: '', icon: GOAL_ICONS[0], color: GOAL_COLORS[0] });

/** Tạo quỹ mục tiêu mới. onCreate(goal) trả về null nếu lỗi. */
export default function GoalModal({ onClose, onCreate }) {
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [saving, setSaving] = useState(false);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onCreate({ ...goalForm, target: Number(goalForm.target) });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Tạo Quỹ Mục Tiêu" icon={Target} onClose={onClose}>
      <form onSubmit={handleCreateGoal} className="p-6 space-y-4 bg-white">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Tên Quỹ</label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            placeholder="VD: Mua xe máy mới"
            value={goalForm.name}
            onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Số Tiền Mục Tiêu (VNĐ)</label>
          <input
            type="number"
            required
            min="1000"
            step="1000"
            placeholder="0"
            value={goalForm.target}
            onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
            className="w-full text-xl font-black px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 tabular-nums focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Biểu Tượng</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => setGoalForm({ ...goalForm, icon })}
                className={`w-10 h-10 rounded-xl text-lg border transition ${goalForm.icon === icon ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Màu Sắc</label>
          <div className="flex gap-2">
            {GOAL_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setGoalForm({ ...goalForm, color })}
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} transition ${goalForm.color === color ? 'ring-2 ring-offset-2 ring-emerald-500' : 'opacity-70 hover:opacity-100'}`}
                aria-label={color}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-cyber w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Tạo Quỹ
        </button>
      </form>
    </Modal>
  );
}
