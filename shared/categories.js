// Danh mục dùng chung cho cả frontend (hiển thị) và backend (kiểm tra dữ liệu).
// File này là JS thuần, không có JSX, để server Node import được trực tiếp.

export const SAVING_CATEGORY = 'Tiết kiệm';

export const CATEGORIES = {
  INCOME: [
    { id: 'Lương', label: 'Lương chính thức', color: 'from-emerald-500 to-teal-500', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '💼' },
    { id: 'Thưởng', label: 'Thưởng & Bonus', color: 'from-cyan-500 to-blue-500', badge: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: '🎁' },
    { id: 'Đầu tư', label: 'Lợi nhuận đầu tư', color: 'from-violet-500 to-purple-500', badge: 'text-violet-700 bg-violet-50 border-violet-200', icon: '📈' },
    { id: 'Khác_THU', label: 'Nguồn thu khác', color: 'from-sky-500 to-indigo-500', badge: 'text-sky-700 bg-sky-50 border-sky-200', icon: '💎' }
  ],
  EXPENSE: [
    { id: 'Ăn uống', label: 'Ăn uống & Cà phê', color: 'from-rose-500 to-orange-400', badge: 'text-rose-700 bg-rose-50 border-rose-200', icon: '🍜', budget: 4000000 },
    { id: 'Di chuyển', label: 'Di chuyển & Xăng xe', color: 'from-amber-500 to-yellow-400', badge: 'text-amber-700 bg-amber-50 border-amber-200', icon: '🏎️', budget: 1500000 },
    { id: 'Shopping', label: 'Mua sắm & Gear', color: 'from-fuchsia-500 to-pink-400', badge: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200', icon: '🛍️', budget: 3000000 },
    { id: 'Hóa đơn', label: 'Hóa đơn & Dịch vụ', color: 'from-indigo-500 to-blue-400', badge: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: '⚡', budget: 2000000 },
    { id: 'Giải trí', label: 'Giải trí & Du lịch', color: 'from-purple-500 to-violet-400', badge: 'text-purple-700 bg-purple-50 border-purple-200', icon: '🎮', budget: 2500000 },
    { id: 'Sức khỏe', label: 'Sức khỏe & Gym', color: 'from-emerald-500 to-green-400', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: '🧬', budget: 1500000 },
    { id: 'Học tập', label: 'Học tập & Nâng cấp', color: 'from-cyan-500 to-teal-400', badge: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: '🚀', budget: 2000000 },
    // Khoản trích vào quỹ mục tiêu: không có hạn mức, không hiện ở trang Hạn mức
    { id: SAVING_CATEGORY, label: 'Trích quỹ tiết kiệm', color: 'from-teal-500 to-emerald-400', badge: 'text-teal-700 bg-teal-50 border-teal-200', icon: '🏦', budget: null, isSaving: true }
  ]
};

export const GOAL_ICONS = ['🛡️', '💻', '✈️', '🏠', '🚗', '🎓', '💍', '📱', '🎯'];
export const GOAL_COLORS = [
  'from-emerald-500 to-teal-500',
  'from-violet-600 to-indigo-500',
  'from-amber-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-fuchsia-500 to-pink-400'
];

export const isValidCategory = (type, category) =>
  Array.isArray(CATEGORIES[type]) && CATEGORIES[type].some(c => c.id === category);
