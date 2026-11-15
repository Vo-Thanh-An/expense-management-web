import { useState } from 'react';
import { Zap, User, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useDelayedFlag } from '../hooks/useDelayedFlag';
import { SERVER_WAKING_MESSAGE } from '../components/ui/LoadingScreen';

const DEMO = { email: 'admin@gmail.com', password: '123456' };

/** Màn hình đăng nhập / đăng ký. onAuthenticate(mode, form) ném lỗi nếu thất bại. */
export default function LoginPage({ notice, onAuthenticate }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [loginError, setLoginError] = useState(notice);
  const [authLoading, setAuthLoading] = useState(false);
  const slow = useDelayedFlag(authLoading);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setAuthLoading(true);
    try {
      await onAuthenticate(authMode, { name, email, password });
    } catch (err) {
      setLoginError(err.message);
      setAuthLoading(false);
    }
  };

  const isRegister = authMode === 'register';
  const inputClass = 'w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition';
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-200/50 rounded-full blur-[100px] pointer-events-none" />

      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden animate-modal relative z-10">
        <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase">FINTECH VAULT</h1>
          <p className="text-emerald-100 text-xs mt-1.5 font-medium tracking-wide">HỆ THỐNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-black">
            {[['login', 'Đăng nhập'], ['register', 'Tạo tài khoản']].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAuthMode(mode);
                  setLoginError('');
                  if (mode === 'register') { setEmail(''); setPassword(''); }
                }}
                className={`py-2.5 rounded-lg transition ${authMode === mode ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-semibold">
              {loginError}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Họ Và Tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required minLength={2} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Đăng Nhập</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={isRegister ? 6 : undefined}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'Tối thiểu 6 ký tự' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="btn-cyber w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập Hệ Thống'}
          </button>

          {slow && (
            <p className="text-[11px] text-center text-slate-500 -mt-2">{SERVER_WAKING_MESSAGE}</p>
          )}

          {!isRegister && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Tài khoản dùng thử:</span>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@gmail.com'); setPassword('123456'); }}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  Điền tự động
                </button>
              </div>
              <p>Email: <code className="text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@gmail.com</code></p>
              <p>Pass: <code className="text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">123456</code></p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
