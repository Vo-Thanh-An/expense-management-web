import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { openDatabase, SCHEMA } from '../src/db/database.js';
import { createLibsqlDb } from '../src/db/adapters/libsql.js';
import { seedDemoData } from '../src/db/seed.js';
import { createFakeLibsqlClient } from './helpers/fake-libsql-client.js';

import { createApp } from '../src/app.js';

/**
 * Bộ test API dùng chung. Chạy lần lượt với:
 *  - 'sqlite': file SQLite (như khi chạy trên máy)
 *  - 'libsql': adapter Turso với client giả lập (như khi deploy)
 */
export function runApiSuite(ADAPTER) {
  let server, base, db;

  before(async () => {
    if (ADAPTER === 'libsql') {
      db = await createLibsqlDb({ client: createFakeLibsqlClient() });
      await db.exec(SCHEMA);
    } else {
      db = await openDatabase({ path: ':memory:' });
    }
    server = createServer(createApp({ db }));
    await new Promise(r => server.listen(0, r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => { server.close(); await db.close(); });

  async function api(path, { method = 'GET', body, token } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: res.status, data: await res.json() };
  }

  const register = (email = `u${Math.random().toString(36).slice(2)}@test.vn`) =>
    api('/api/auth/register', { method: 'POST', body: { name: 'Người Test', email, password: 'matkhau123' } });

  test('health', async () => {
    assert.deepEqual((await api('/api/health')).data, { ok: true, database: ADAPTER });
  });

  test('transaction lỗi giữa chừng thì rollback toàn bộ', async () => {
    const before = (await db.get('SELECT COUNT(*) AS n FROM users')).n;
    await assert.rejects(db.transaction(async tx => {
      await tx.run("INSERT INTO users (name, email, password_hash) VALUES ('r', 'rollback@test.vn', 'x')");
      throw new Error('lỗi giả');
    }));
    assert.equal((await db.get('SELECT COUNT(*) AS n FROM users')).n, before);
  });

  test('đăng ký, đăng nhập, me, đăng xuất', async () => {
    const r = await register('an@test.vn');
    assert.equal(r.status, 201);
    assert.ok(r.data.token);
    assert.equal(r.data.user.email, 'an@test.vn');
    assert.equal(r.data.user.password_hash, undefined);

    assert.equal((await register('AN@test.vn')).status, 409, 'email trùng (không phân biệt hoa thường)');

    assert.equal((await api('/api/auth/login', { method: 'POST', body: { email: 'an@test.vn', password: 'sai' } })).status, 401);
    const login = await api('/api/auth/login', { method: 'POST', body: { email: 'An@Test.vn', password: 'matkhau123' } });
    assert.equal(login.status, 200);

    assert.equal((await api('/api/auth/me', { token: login.data.token })).data.user.name, 'Người Test');
    await api('/api/auth/logout', { method: 'POST', token: login.data.token });
    assert.equal((await api('/api/auth/me', { token: login.data.token })).status, 401, 'token bị thu hồi sau khi đăng xuất');
  });

  test('chặn khi chưa đăng nhập và validate đăng ký', async () => {
    assert.equal((await api('/api/transactions')).status, 401);
    assert.equal((await api('/api/transactions', { token: 'token-sai' })).status, 401);
    const bad = await api('/api/auth/register', { method: 'POST', body: { name: 'A B', email: 'x@y.z', password: '123' } });
    assert.equal(bad.status, 400);
  });

  test('CRUD giao dịch và cách ly dữ liệu giữa các user', async () => {
    const { data: { token } } = await register();
    const { data: { token: other } } = await register();

    const created = await api('/api/transactions', { method: 'POST', token, body: { type: 'EXPENSE', category: 'Ăn uống', amount: 50000, date: '2026-11-10', note: 'Phở' } });
    assert.equal(created.status, 201);
    assert.equal(created.data.amount, 50000);

    for (const body of [
      { type: 'EXPENSE', category: 'Lương', amount: 1, date: '2026-11-10' },     // danh mục sai loại
      { type: 'EXPENSE', category: 'Ăn uống', amount: -5, date: '2026-11-10' },  // số âm
      { type: 'EXPENSE', category: 'Ăn uống', amount: 5, date: '2026-02-30' },   // ngày không tồn tại
      { type: 'EXPENSE', category: 'Tiết kiệm', amount: 5, date: '2026-11-10' }  // phải dùng nạp quỹ
    ]) {
      assert.equal((await api('/api/transactions', { method: 'POST', token, body })).status, 400, JSON.stringify(body));
    }

    const id = created.data.id;
    const upd = await api(`/api/transactions/${id}`, { method: 'PUT', token, body: { type: 'EXPENSE', category: 'Ăn uống', amount: 65000, date: '2026-11-11', note: 'Phở đặc biệt' } });
    assert.equal(upd.data.amount, 65000);
    assert.equal(upd.data.note, 'Phở đặc biệt');

    assert.equal((await api(`/api/transactions/${id}`, { method: 'DELETE', token: other })).status, 404, 'user khác không xoá được');
    assert.equal((await api('/api/transactions', { token: other })).data.length, 0);

    assert.equal((await api(`/api/transactions/${id}`, { method: 'DELETE', token })).status, 200);
    assert.equal((await api('/api/transactions', { token })).data.length, 0);
  });

  test('nạp quỹ: kiểm tra số dư, giới hạn mục tiêu, xoá khoản nạp và xoá quỹ', async () => {
    const { data: { token } } = await register();
    const goal = (await api('/api/goals', { method: 'POST', token, body: { name: 'Mua laptop', target: 3000000, icon: '💻' } })).data;
    assert.equal(goal.current, 0);

    const poor = await api(`/api/goals/${goal.id}/deposit`, { method: 'POST', token, body: { amount: 1000000 } });
    assert.equal(poor.status, 400, 'số dư 0 thì không nạp được');

    await api('/api/transactions', { method: 'POST', token, body: { type: 'INCOME', category: 'Lương', amount: 10000000, date: '2026-11-01' } });
    const d1 = await api(`/api/goals/${goal.id}/deposit`, { method: 'POST', token, body: { amount: 2000000 } });
    assert.equal(d1.status, 200);
    assert.equal(d1.data.goal.current, 2000000);
    assert.equal(d1.data.transaction.category, 'Tiết kiệm');
    assert.equal(d1.data.transaction.goalId, goal.id);

    const d2 = await api(`/api/goals/${goal.id}/deposit`, { method: 'POST', token, body: { amount: 5000000 } });
    assert.equal(d2.data.deposited, 1000000, 'chỉ nạp phần còn thiếu');
    assert.equal(d2.data.goal.current, 3000000);
    assert.equal((await api(`/api/goals/${goal.id}/deposit`, { method: 'POST', token, body: { amount: 1000 } })).status, 400, 'quỹ đã đầy');

    assert.equal((await api(`/api/transactions/${d1.data.transaction.id}`, { method: 'PUT', token, body: { type: 'EXPENSE', category: 'Ăn uống', amount: 1, date: '2026-11-01' } })).status, 400);
    const del = await api(`/api/transactions/${d1.data.transaction.id}`, { method: 'DELETE', token });
    assert.equal(del.data.goal.current, 1000000, 'xoá khoản nạp thì quỹ giảm theo');

    const delGoal = await api(`/api/goals/${goal.id}`, { method: 'DELETE', token });
    assert.deepEqual(delGoal.data.removedTransactionIds, [d2.data.transaction.id]);
    const txs = (await api('/api/transactions', { token })).data;
    assert.equal(txs.length, 1, 'chỉ còn khoản lương');
  });

  test('hạn mức và khôi phục dữ liệu mẫu', async () => {
    const { data: { token } } = await register();
    const b = (await api('/api/budgets', { token })).data;
    assert.equal(b['Ăn uống'], 4000000);
    assert.equal(b['Tiết kiệm'], undefined);

    const upd = await api(`/api/budgets/${encodeURIComponent('Ăn uống')}`, { method: 'PUT', token, body: { amount: 5500000 } });
    assert.equal(upd.data['Ăn uống'], 5500000);
    assert.equal((await api(`/api/budgets/${encodeURIComponent('Tiết kiệm')}`, { method: 'PUT', token, body: { amount: 1 } })).status, 400);

    assert.equal((await api('/api/demo/reset', { method: 'POST', token })).status, 200);
    const boot = (await api('/api/bootstrap', { token })).data;
    assert.equal(boot.transactions.length, 10);
    assert.equal(boot.goals.length, 3);
    assert.equal(boot.budgets['Ăn uống'], 4000000, 'reset đưa hạn mức về mặc định');
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(boot.transactions.every(t => t.date <= today), 'dữ liệu mẫu không có ngày trong tương lai');
  });

  test('đổi mật khẩu', async () => {
    const email = 'pw@test.vn';
    const { data: { token } } = await register(email);
    assert.equal((await api('/api/auth/change-password', { method: 'POST', token, body: { currentPassword: 'sai', newPassword: 'moi123456' } })).status, 400);
    assert.equal((await api('/api/auth/change-password', { method: 'POST', token, body: { currentPassword: 'matkhau123', newPassword: 'moi123456' } })).status, 200);
    assert.equal((await api('/api/auth/login', { method: 'POST', body: { email, password: 'moi123456' } })).status, 200);
  });

  test('giới hạn đăng nhập sai', async () => {
    const email = 'brute@test.vn';
    await register(email);
    for (let i = 0; i < 10; i++) await api('/api/auth/login', { method: 'POST', body: { email, password: 'sai' } });
    assert.equal((await api('/api/auth/login', { method: 'POST', body: { email, password: 'matkhau123' } })).status, 429);
  });

  test('seedDemoData tạo đúng số bản ghi', async () => {
    const { lastInsertRowid } = await db.run("INSERT INTO users (name, email, password_hash) VALUES ('x', 'seed@test.vn', 'x')");
    await seedDemoData(db, lastInsertRowid, new Date(2026, 0, 3)); // ngày 3/1: tháng trước là 12/2025
    const rows = await db.all('SELECT date FROM transactions WHERE user_id = ?', lastInsertRowid);
    assert.equal(rows.length, 10);
    assert.ok(rows.some(r => r.date.startsWith('2025-12')));
    assert.ok(rows.every(r => r.date <= '2026-01-03'));
  });
}
