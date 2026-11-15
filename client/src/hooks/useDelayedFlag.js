import { useState, useEffect } from 'react';

/**
 * Trả về true khi `active` đã bật liên tục quá `delay` ms.
 * Dùng để hiện thông báo "máy chủ đang khởi động" khi request chờ lâu
 * (server miễn phí trên Render ngủ sau 15 phút không có truy cập, mất ~1 phút để thức dậy).
 */
export function useDelayedFlag(active, delay = 4000) {
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if (!active) { setFlag(false); return; }
    const t = setTimeout(() => setFlag(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return flag;
}
