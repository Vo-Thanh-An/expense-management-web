import { createServer } from 'node:http';
import { config } from './config.js';
import { openDatabase } from './db/database.js';
import { ensureDemoUser } from './db/seed.js';
import { purgeExpiredSessions } from './auth/session.js';
import { createApp } from './app.js';

const db = await openDatabase(config.database);

// Tạo tài khoản demo (admin@gmail.com / 123456) kèm dữ liệu mẫu ở lần chạy đầu tiên
if (config.demo.enabled && await ensureDemoUser(db, config.demo)) {
  console.log(`✔ Đã tạo tài khoản demo: ${config.demo.email}`);
}

await purgeExpiredSessions(db);
setInterval(() => purgeExpiredSessions(db).catch(console.error), 60 * 60 * 1000).unref();

const server = createServer(createApp({ db, corsOrigin: config.corsOrigin, staticDir: config.staticDir }));

server.listen(config.port, () => {
  console.log(`🚀 FINTECH VAULT API đang chạy tại http://localhost:${config.port}`);
  console.log(`   Database: ${db.kind === 'libsql' ? `Turso (${config.database.url})` : config.database.path}`);
  if (config.staticDir) console.log(`   Đang phục vụ giao diện từ: ${config.staticDir}`);
});

const shutdown = () => server.close(async () => { await db.close(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
