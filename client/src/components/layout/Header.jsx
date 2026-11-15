import { Plus } from 'lucide-react';

export default function Header({ title, userName, onCreate }) {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500">Xin chào, <span className="text-emerald-600 font-bold">{userName}</span></p>
      </div>

      <button
        onClick={onCreate}
        className="btn-cyber bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Thêm Thu / Chi</span>
      </button>
    </header>
  );
}
