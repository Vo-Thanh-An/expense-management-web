import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(serverRoot, '..');

// Đọc file .env ở thư mục gốc dự án nếu có (Node >= 21.7 hỗ trợ sẵn)
try { process.loadEnvFile(resolve(projectRoot, '.env')); } catch { /* không có .env thì dùng mặc định */ }

const clientDist = resolve(projectRoot, 'client', 'dist');

export const config = {
  port: Number(process.env.PORT) || 4000,
  database: {
    // Có TURSO_DATABASE_URL → dùng Turso (khi deploy); không có → file SQLite trên máy
    url: process.env.TURSO_DATABASE_URL || null,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    path: process.env.DB_PATH || resolve(serverRoot, 'data', 'fintech-vault.db')
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  // Nếu đã build frontend (client/dist) thì server phục vụ luôn giao diện
  staticDir: process.env.SERVE_STATIC === 'false' ? null : (existsSync(clientDist) ? clientDist : null),
  demo: {
    enabled: process.env.SEED_DEMO !== 'false',
    email: process.env.DEMO_EMAIL || 'admin@gmail.com',
    password: process.env.DEMO_PASSWORD || '123456'
  }
};
