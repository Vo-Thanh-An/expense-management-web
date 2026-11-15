import { LayoutDashboard, Layers, BarChart3, Target, User } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Trung Tâm', icon: LayoutDashboard },
  { id: 'ledger', label: 'Sổ Giao Dịch', icon: Layers },
  { id: 'analytics', label: 'Phân Tích Tháng', icon: BarChart3 },
  { id: 'budgets', label: 'Hạn Mức & Quỹ', icon: Target },
  { id: 'settings', label: 'Hệ Thống', icon: User }
];
