/** Giới hạn số lần đăng nhập sai (lưu trong RAM): tối đa `max` lần mỗi `windowMs`. */
export function createRateLimiter({ max = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const hits = new Map();
  return {
    isBlocked(key) {
      const h = hits.get(key);
      if (!h) return false;
      if (Date.now() - h.start > windowMs) { hits.delete(key); return false; }
      return h.count >= max;
    },
    fail(key) {
      const h = hits.get(key);
      if (!h || Date.now() - h.start > windowMs) hits.set(key, { start: Date.now(), count: 1 });
      else h.count++;
    },
    reset(key) { hits.delete(key); }
  };
}
