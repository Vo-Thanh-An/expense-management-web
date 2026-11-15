import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2'
};

/**
 * Phục vụ file tĩnh của bản build frontend (client/dist).
 * Đường dẫn không tồn tại sẽ trả về index.html (SPA fallback).
 * Trả về true nếu đã phản hồi.
 */
export async function serveStatic(req, res, pathname, rootDir) {
  if (!rootDir || (req.method !== 'GET' && req.method !== 'HEAD')) return false;

  const root = normalize(rootDir + sep);
  let file = normalize(join(rootDir, decodeURIComponent(pathname)));
  if (!file.startsWith(root) && file !== normalize(rootDir)) return false; // chặn ../

  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    file = join(rootDir, 'index.html');
  }

  try {
    const content = await readFile(file);
    const isHashedAsset = file.includes(`${sep}assets${sep}`);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': isHashedAsset ? 'public, max-age=31536000, immutable' : 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : content);
    return true;
  } catch {
    return false;
  }
}
