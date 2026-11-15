import { useState } from 'react';
import { User, KeyRound, Save, Download, RefreshCw, LogOut } from 'lucide-react';

export default function SettingsPage({ user, actions, onExport }) {
  const [profileName, setProfileName] = useState(user.name);
  const [pwForm, setPwForm] = useState({ current: '', next: '' });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    actions.updateProfile(profileName);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (await actions.changePassword(pwForm.current, pwForm.next)) setPwForm({ current: '', next: '' });
  };

  const handleResetDemo = () => {
    if (window.confirm('Xoá dữ liệu hiện tại và khôi phục toàn bộ dữ liệu mẫu ban đầu?')) actions.resetDemo();
  };

  return (
    <div className="max-w-2xl mx-auto light-card rounded-3xl overflow-hidden animate-page">
      <div className="p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black shadow-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-white/20 text-white">
            {user.tier}
          </span>
          <h3 className="text-xl font-black text-white mt-1">{user.name}</h3>
          <p className="text-xs text-emerald-100">{user.email}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <form onSubmit={handleSaveProfile} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" /> Hồ Sơ Cá Nhân</h4>
          <div className="flex gap-2">
            <input
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              aria-label="Tên hiển thị"
            />
            <button type="submit" className="btn-cyber px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
              <Save className="w-4 h-4" /> Lưu
            </button>
          </div>
        </form>

        <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2"><KeyRound className="w-4 h-4 text-emerald-600" /> Đổi Mật Khẩu</h4>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Mật khẩu hiện tại"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              className="min-w-0 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Mật khẩu mới (≥ 6 ký tự)"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              className="min-w-0 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="btn-cyber px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs">
              Đổi
            </button>
          </div>
        </form>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Xuất Dữ Liệu Sao Lưu (JSON)</h4>
            <p className="text-xs text-slate-500">Tải giao dịch, quỹ và hạn mức về máy tính cá nhân</p>
          </div>
          <button
            onClick={onExport}
            className="btn-cyber px-4 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" /> Tải JSON
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Reset Dữ Liệu Hệ Thống</h4>
            <p className="text-xs text-slate-500">Xoá dữ liệu hiện tại và nạp lại dữ liệu mẫu</p>
          </div>
          <button
            onClick={handleResetDemo}
            className="btn-cyber px-4 py-2.5 bg-white hover:bg-slate-50 text-amber-600 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" /> Khôi Phục
          </button>
        </div>

        <button
          onClick={actions.logout}
          className="btn-cyber w-full py-3.5 mt-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-black uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Đăng Xuất Tài Khoản
        </button>
      </div>
    </div>
  );
}
