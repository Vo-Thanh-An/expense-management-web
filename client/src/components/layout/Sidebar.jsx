import { Plus, Zap } from 'lucide-react';
import { NAV_ITEMS } from '../../config/navigation';

export default function Sidebar({ currentPage, onNavigate, onCreate }) {
  return (
    <aside className="hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-black tracking-wider text-base text-slate-900">FINTECH VAULT</h1>
          <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">LIGHT EDITION • PRO</span>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Menu Điều Hướng</p>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {active && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onCreate}
          className="btn-cyber w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Giao Dịch Mới
        </button>
      </div>
    </aside>
  );
}
