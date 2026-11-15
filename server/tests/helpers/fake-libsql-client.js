import { DatabaseSync } from 'node:sqlite';

/**
 * Client giả lập giao diện của @libsql/client (execute / executeMultiple / transaction),
 * chạy trên SQLite trong RAM. Dùng để test adapter Turso mà không cần mạng.
 * Giống bản thật: rows là mảng giá trị theo cột, lastInsertRowid là BigInt,
 * args truyền dạng mảng và không chấp nhận `undefined`.
 */
export function createFakeLibsqlClient() {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');

  const execute = ({ sql, args = [] }) => {
    if (!Array.isArray(args)) throw new TypeError('args phải là mảng');
    if (args.some(a => a === undefined)) throw new TypeError('libsql không nhận giá trị undefined');
    const stmt = raw.prepare(sql);
    const columns = stmt.columns().map(c => c.name);
    if (columns.length) {
      stmt.setReturnArrays?.(true);
      const rows = stmt.all(...args).map(r => (Array.isArray(r) ? r : Object.values(r)));
      return { columns, rows, rowsAffected: 0, lastInsertRowid: undefined };
    }
    const r = stmt.run(...args);
    return { columns: [], rows: [], rowsAffected: Number(r.changes), lastInsertRowid: BigInt(r.lastInsertRowid) };
  };

  return {
    execute: async stmt => execute(typeof stmt === 'string' ? { sql: stmt } : stmt),
    executeMultiple: async sql => { raw.exec(sql); },
    transaction: async () => {
      raw.exec('BEGIN');
      const tx = {
        closed: false,
        execute: async stmt => {
          if (tx.closed) throw new Error('Transaction đã đóng');
          return execute(stmt);
        },
        commit: async () => { raw.exec('COMMIT'); tx.closed = true; },
        rollback: async () => { raw.exec('ROLLBACK'); tx.closed = true; },
        close: () => { if (!tx.closed) { raw.exec('ROLLBACK'); tx.closed = true; } }
      };
      return tx;
    },
    close: () => raw.close()
  };
}
