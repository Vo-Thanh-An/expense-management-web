/**
 * Database Turso (libSQL) — dùng khi deploy để dữ liệu không bị mất khi server khởi động lại.
 * `client` chỉ truyền vào khi chạy test; bình thường sẽ tạo bằng @libsql/client.
 */
export async function createLibsqlDb({ url, authToken, client }) {
  if (!client) {
    const { createClient } = await import('@libsql/client');
    client = createClient({ url, authToken });
  }

  // Đổi Row của libsql thành object thường { tên_cột: giá_trị }
  const toObjects = rs => rs.rows.map(row => Object.fromEntries(rs.columns.map((col, i) => [col, row[i]])));

  const wrap = conn => ({
    get: async (sql, ...args) => toObjects(await conn.execute({ sql, args }))[0],
    all: async (sql, ...args) => toObjects(await conn.execute({ sql, args })),
    run: async (sql, ...args) => {
      const rs = await conn.execute({ sql, args });
      return {
        lastInsertRowid: rs.lastInsertRowid === undefined ? undefined : Number(rs.lastInsertRowid),
        changes: rs.rowsAffected
      };
    }
  });

  return {
    kind: 'libsql',
    ...wrap(client),
    exec: sql => client.executeMultiple(sql),
    async transaction(fn) {
      const tx = await client.transaction('write');
      try {
        const value = await fn(wrap(tx));
        await tx.commit();
        return value;
      } catch (err) {
        if (!tx.closed) await tx.rollback().catch(() => {});
        throw err;
      } finally {
        tx.close();
      }
    },
    close: async () => client.close()
  };
}
