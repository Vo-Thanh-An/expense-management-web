import { HttpError, created } from '../lib/http.js';
import { requireString, requireEmail, requirePassword } from '../lib/validation.js';
import { insertDefaultBudgets } from '../db/seed.js';
import { publicUser } from '../db/queries.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { createSession, deleteSession } from '../auth/session.js';
import { createRateLimiter } from '../auth/rate-limiter.js';

export function registerAuthRoutes(router, { db }) {
  const loginLimiter = createRateLimiter();

  router.post('/api/auth/register', async ({ body }) => {
    const name = requireString(body.name, 'name', { min: 2, max: 60 });
    const email = requireEmail(body.email);
    const password = requirePassword(body.password);

    if (await db.get('SELECT 1 AS found FROM users WHERE email = ?', email)) {
      throw new HttpError(409, 'Email này đã được đăng ký');
    }
    const hash = await hashPassword(password);
    const user = await db.transaction(async tx => {
      const { lastInsertRowid: id } = await tx.run(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', name, email, hash
      );
      await insertDefaultBudgets(tx, id);
      return { id, name, email, tier: 'MEMBER' };
    });
    return created({ token: await createSession(db, user.id), user: publicUser(user) });
  }, { auth: false });

  router.post('/api/auth/login', async ({ body, req }) => {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const key = `${req.socket.remoteAddress}|${email}`;
    if (loginLimiter.isBlocked(key)) {
      throw new HttpError(429, 'Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút');
    }

    const row = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      loginLimiter.fail(key);
      throw new HttpError(401, 'Email hoặc mật khẩu không đúng');
    }
    loginLimiter.reset(key);
    return { token: await createSession(db, row.id), user: publicUser(row) };
  }, { auth: false });

  router.post('/api/auth/logout', async ({ token }) => {
    await deleteSession(db, token);
    return { ok: true };
  });

  router.get('/api/auth/me', ({ user }) => ({ user: publicUser(user) }));

  router.patch('/api/auth/me', async ({ user, body }) => {
    const name = requireString(body.name, 'name', { min: 2, max: 60 });
    await db.run('UPDATE users SET name = ? WHERE id = ?', name, user.id);
    return { user: publicUser({ ...user, name }) };
  });

  router.post('/api/auth/change-password', async ({ user, body }) => {
    const row = await db.get('SELECT password_hash FROM users WHERE id = ?', user.id);
    if (!(await verifyPassword(String(body.currentPassword ?? ''), row.password_hash))) {
      throw new HttpError(400, 'Mật khẩu hiện tại không đúng');
    }
    const next = requirePassword(body.newPassword, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(next), user.id);
    return { ok: true };
  });
}
