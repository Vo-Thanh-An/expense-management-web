const pad = n => String(n).padStart(2, '0');

const vndFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

/** 1500000 → "1.500.000 ₫" */
export const formatVND = num => vndFormatter.format(num);

/** Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD */
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Tháng hiện tại dạng YYYY-MM */
export const currentMonthStr = () => todayStr().slice(0, 7);

/** Tháng liền trước của "YYYY-MM" */
export const previousMonthStr = month => {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 2, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
