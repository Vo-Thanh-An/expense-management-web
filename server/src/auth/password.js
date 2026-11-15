import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

/** Băm mật khẩu bằng scrypt; kết quả có dạng "scrypt$<salt>$<hash>". */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

export async function verifyPassword(password, stored) {
  const [algo, salt, hashHex] = String(stored).split('$');
  if (algo !== 'scrypt' || !salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const key = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(key, expected);
}
