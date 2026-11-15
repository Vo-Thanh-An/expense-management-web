// Tiện ích HTTP tối giản: lỗi có mã trạng thái, router, đọc body JSON, trả JSON.

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const CREATED = Symbol('created');

/** Đánh dấu kết quả trả về là 201 Created. */
export const created = data => ({ [CREATED]: true, data });
export const isCreated = result => Boolean(result && result[CREATED]);

/**
 * Router đơn giản hỗ trợ tham số dạng `/api/goals/:id`.
 * Mỗi route có `auth` (mặc định true) để quyết định có yêu cầu đăng nhập không.
 */
export function createRouter() {
  const routes = [];

  const add = (method, path, handler, { auth = true } = {}) => {
    const keys = [];
    const pattern = new RegExp(
      '^' + path.replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)'; }) + '$'
    );
    routes.push({ method, pattern, keys, handler, auth });
  };

  const match = (method, pathname) => {
    let methodMismatch = false;
    for (const r of routes) {
      const m = pathname.match(r.pattern);
      if (!m) continue;
      if (r.method !== method) { methodMismatch = true; continue; }
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { route: r, params };
    }
    if (methodMismatch) throw new HttpError(405, 'Phương thức không được hỗ trợ');
    throw new HttpError(404, 'API không tồn tại');
  };

  return {
    get: (path, h, o) => add('GET', path, h, o),
    post: (path, h, o) => add('POST', path, h, o),
    put: (path, h, o) => add('PUT', path, h, o),
    patch: (path, h, o) => add('PATCH', path, h, o),
    delete: (path, h, o) => add('DELETE', path, h, o),
    match
  };
}

export function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(JSON.stringify(data));
}

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Dữ liệu gửi lên quá lớn'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        resolve(parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {});
      } catch {
        reject(new HttpError(400, 'Body không phải JSON hợp lệ'));
      }
    });
    req.on('error', reject);
  });
}

export function corsHeaders(req, allowedOrigins) {
  const origin = req.headers.origin;
  if (!origin) return {};
  const allowAll = allowedOrigins === '*';
  if (!allowAll && !allowedOrigins.split(',').map(s => s.trim()).includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': allowAll ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin'
  };
}
