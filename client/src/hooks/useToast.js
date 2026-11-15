import { useState, useRef, useCallback, useEffect } from 'react';

/** Thông báo nhỏ ở góc màn hình, tự ẩn sau ~3 giây. type: 'success' | 'delete' */
export function useToast(duration = 2800) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), duration);
  }, [duration]);

  const showError = useCallback(
    err => showToast(err?.message || 'Đã có lỗi xảy ra', 'delete'),
    [showToast]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast, showError };
}
