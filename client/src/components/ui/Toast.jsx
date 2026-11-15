import { CheckCircle2 } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-24 lg:bottom-8 right-6 z-50 animate-modal">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold tracking-wide ${
        toast.type === 'delete'
          ? 'bg-slate-900 border-slate-700 text-white'
          : 'bg-emerald-600 border-emerald-500 text-white'
      }`}>
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
