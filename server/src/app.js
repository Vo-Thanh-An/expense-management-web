import { HttpError, createRouter, isCreated, sendJson, readJsonBody, corsHeaders } from './lib/http.js';
import { serveStatic } from './lib/static.js';
import { getUserByToken } from './auth/session.js';
import { registerAuthRoutes } from './routes/auth.routes.js';
import { registerTransactionRoutes } from './routes/transactions.routes.js';
import { registerGoalRoutes } from './routes/goals.routes.js';
import { registerBudgetRoutes } from './routes/budgets.routes.js';
import { registerSystemRoutes } from './routes/system.routes.js';

/**
 * Tạo request handler cho node:http.
 * @param {{ db: object, corsOrigin?: string, staticDir?: string|null }} options  (db: xem db/database.js)
 */
export function createApp({ db, corsOrigin = '*', staticDir = null }) {
  const router = createRouter();
  const deps = { db };
  registerSystemRoutes(router, deps);
  registerAuthRoutes(router, deps);
  registerTransactionRoutes(router, deps);
  registerGoalRoutes(router, deps);
  registerBudgetRoutes(router, deps);

  return async function handleRequest(req, res) {
    const cors = corsHeaders(req, corsOrigin);
    try {
      const { pathname } = new URL(req.url, 'http://localhost');

      if (req.method === 'OPTIONS') {
        res.writeHead(204, cors);
        return res.end();
      }

      // Không phải API → phục vụ giao diện đã build (nếu có)
      if (!pathname.startsWith('/api/')) {
        if (await serveStatic(req, res, pathname, staticDir)) return;
        return sendJson(res, 404, { error: 'Không tìm thấy' }, cors);
      }

      const { route, params } = router.match(req.method, pathname);
      const ctx = { req, params, body: {}, user: null, token: null };

      if (route.auth) {
        const header = req.headers.authorization ?? '';
        ctx.token = header.startsWith('Bearer ') ? header.slice(7) : null;
        ctx.user = await getUserByToken(db, ctx.token);
        if (!ctx.user) throw new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) ctx.body = await readJsonBody(req);

      const result = await route.handler(ctx);
      if (isCreated(result)) return sendJson(res, 201, result.data, cors);
      return sendJson(res, 200, result, cors);
    } catch (err) {
      if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message }, cors);
      console.error(err);
      return sendJson(res, 500, { error: 'Lỗi máy chủ, vui lòng thử lại' }, cors);
    }
  };
}
