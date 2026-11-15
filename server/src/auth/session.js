import { randomBytes, createHash } from 'node:crypto';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 ngày

const sha256 = s => createHash('sha256').update(s).digest('hex');

/** Tạo phiên đăng nhập. DB chỉ lưu hash của token, token gốc chỉ trả cho client. */
export async function createSession(db, userId) {
  const token = randomBytes(32).toString('base64url');
  await db.run('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    sha256(token), userId, Date.now() + SESSION_TTL_MS);
  return token;
}

export async function getUserByToken(db, token) {
  if (!token) return null;
  const row = await db.get(`
    SELECT u.id, u.name, u.email, u.tier, s.expires_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `, sha256(token));
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await deleteSession(db, token);
    return null;
  }
  const { expires_at, ...user } = row;
  return user;
}

export async function deleteSession(db, token) {
  if (token) await db.run('DELETE FROM sessions WHERE token_hash = ?', sha256(token));
}

export async function purgeExpiredSessions(db) {
  await db.run('DELETE FROM sessions WHERE expires_at < ?', Date.now());
}
