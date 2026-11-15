import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/** Database dạng file SQLite cục bộ, dùng `node:sqlite` có sẵn trong Node 22 (không cần cài thêm). */
export function createSqliteDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const raw = new DatabaseSync(path);
  raw.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const ops = {
    get: async (sql, ...args) => raw.prepare(sql).get(...args),
    all: async (sql, ...args) => raw.prepare(sql).all(...args),
    run: async (sql, ...args) => {
      const r = raw.prepare(sql).run(...args);
      return { lastInsertRowid: Number(r.lastInsertRowid), changes: Number(r.changes) };
    }
  };

  // Chỉ có 1 kết nối, nên các transaction được xếp hàng chạy lần lượt
  let queue = Promise.resolve();

  return {
    kind: 'sqlite',
    ...ops,
    exec: async sql => raw.exec(sql),
    transaction(fn) {
      const result = queue.then(async () => {
        raw.exec('BEGIN');
        try {
          const value = await fn(ops);
          raw.exec('COMMIT');
          return value;
        } catch (err) {
          raw.exec('ROLLBACK');
          throw err;
        }
      });
      queue = result.catch(() => {});
      return result;
    },
    close: async () => raw.close()
  };
}
