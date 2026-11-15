import { Loader2 } from 'lucide-react';
import { useDelayedFlag } from '../../hooks/useDelayedFlag';

export const SERVER_WAKING_MESSAGE = 'Máy chủ đang khởi động, lần đầu có thể mất khoảng 1 phút...';

export default function LoadingScreen({ message = 'Đang tải dữ liệu...' }) {
  const slow = useDelayedFlag(true);
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <p className="text-xs font-bold uppercase tracking-widest">{message}</p>
      {slow && <p className="text-xs text-slate-400">{SERVER_WAKING_MESSAGE}</p>}
    </div>
  );
}
