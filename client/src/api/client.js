// Lớp gọi API tới backend. Token đăng nhập được lưu trong localStorage.
// VITE_API_URL: địa chỉ backend khi deploy tách riêng (vd: https://fintech-vault-api.onrender.com).
// Để trống khi chạy local: Vite proxy /api sang http://localhost:4000.

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'fintech_vault_token';

export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = t => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

let onUnauthorized = () => {};
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

async function request(path, { method = 'GET', body } = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.error || `Lỗi ${res.status}`);
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  register: (name, email, password) => request('/api/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST', body: {} }),
  updateProfile: name => request('/api/auth/me', { method: 'PATCH', body: { name } }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  bootstrap: () => request('/api/bootstrap'),

  createTransaction: tx => request('/api/transactions', { method: 'POST', body: tx }),
  updateTransaction: (id, tx) => request(`/api/transactions/${enc(id)}`, { method: 'PUT', body: tx }),
  deleteTransaction: id => request(`/api/transactions/${enc(id)}`, { method: 'DELETE' }),

  createGoal: goal => request('/api/goals', { method: 'POST', body: goal }),
  deleteGoal: id => request(`/api/goals/${enc(id)}`, { method: 'DELETE' }),
  depositGoal: (id, amount) => request(`/api/goals/${enc(id)}/deposit`, { method: 'POST', body: { amount } }),

  updateBudget: (category, amount) => request(`/api/budgets/${enc(category)}`, { method: 'PUT', body: { amount } }),

  resetDemo: () => request('/api/demo/reset', { method: 'POST', body: {} })
};
