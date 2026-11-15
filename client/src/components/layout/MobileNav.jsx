import { NAV_ITEMS } from '../../config/navigation';

export default function MobileNav({ currentPage, onNavigate }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40 px-2 py-2 flex justify-around items-center shadow-lg">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const active = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition ${
              active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
