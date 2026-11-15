import { createSqliteDb } from './adapters/sqlite.js';
import { createLibsqlDb } from './adapters/libsql.js';

/**
 * Mọi module khác chỉ làm việc với interface chung này (tất cả đều async):
 *   db.get(sql, ...args)   → 1 dòng (object) hoặc undefined
 *   db.all(sql, ...args)   → mảng object
 *   db.run(sql, ...args)   → { lastInsertRowid, changes }
 *   db.exec(sql)           → chạy nhiều câu lệnh (tạo bảng)
 *   db.transaction(async tx => ...)  → tx có get/all/run như trên; lỗi thì tự rollback
 *   db.close()
 */

export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    tier          TEXT    NOT NULL DEFAULT 'MEMBER',
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goals (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    target     INTEGER NOT NULL CHECK (target > 0),
    current    INTEGER NOT NULL DEFAULT 0 CHECK (current >= 0),
    icon       TEXT    NOT NULL DEFAULT '🎯',
    color      TEXT    NOT NULL DEFAULT 'from-emerald-500 to-teal-500',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       TEXT    NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category   TEXT    NOT NULL,
    amount     INTEGER NOT NULL CHECK (amount > 0),
    date       TEXT    NOT NULL,
    note       TEXT    NOT NULL DEFAULT '',
    goal_id    INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date DESC);

  CREATE TABLE IF NOT EXISTS budgets (
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT    NOT NULL,
    amount   INTEGER NOT NULL CHECK (amount >= 0),
    PRIMARY KEY (user_id, category)
  );
`;

/**
 * Mở database:
 * - Có `url` (TURSO_DATABASE_URL) → kết nối Turso qua @libsql/client (dùng khi deploy).
 * - Không có → file SQLite tại `path` (dùng khi chạy trên máy).
 */
export async function openDatabase({ url, authToken, path }) {
  const db = url ? await createLibsqlDb({ url, authToken }) : createSqliteDb(path);
  await db.exec(SCHEMA);
  return db;
}
