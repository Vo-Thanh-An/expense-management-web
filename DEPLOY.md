# 🚀 Hướng dẫn deploy FINTECH VAULT (miễn phí)

Ứng dụng gồm 3 phần, mỗi phần chạy ở một nơi:

| Phần | Nơi chạy | Vai trò |
| --- | --- | --- |
| Giao diện (`client/`) | **Vercel** | Trang web người dùng mở trên trình duyệt |
| Backend (`server/`) | **Render** | API: đăng nhập, lưu giao dịch, quỹ, hạn mức |
| Database | **Turso** | Lưu toàn bộ dữ liệu, không mất khi server khởi động lại |

```
Trình duyệt ──► Vercel (giao diện) ──► Render (API) ──► Turso (database)
```

Cả 3 đều có gói miễn phí và đăng nhập được bằng tài khoản GitHub.

> ⏱️ **Lưu ý:** backend miễn phí trên Render sẽ "ngủ" nếu 15 phút không có ai truy cập.
> Lần truy cập đầu tiên sau đó phải chờ khoảng 1 phút để server thức dậy (giao diện có hiện thông báo).
> Dữ liệu **không** bị ảnh hưởng vì nằm ở Turso.

---

## Bước 0 — Đưa code lên GitHub

1. Giải nén code mới, mở terminal ở thư mục gốc (thư mục có `package.json`, `client/`, `server/`).
2. Chạy:
   ```bash
   npm install
   ```
   Lệnh này cài thư viện và **cập nhật file `package-lock.json`** (đã thêm thư viện kết nối Turso). Bắt buộc phải commit file này.
3. Chạy thử trên máy:
   ```bash
   npm run dev:server   # terminal 1
   npm run dev          # terminal 2 → mở http://localhost:5173
   ```
4. Commit và push lên repo `expense-management-web` trên GitHub.

---

## Bước 1 — Tạo database trên Turso

1. Vào **https://turso.tech** → **Sign up / Log in** (chọn đăng nhập bằng GitHub).
2. Trong trang quản lý, bấm **Create Database**.
   - Tên: `fintech-vault`
   - Vị trí (location/region): chọn nơi **gần Singapore nhất** có trong danh sách (vì backend Render cũng đặt ở Singapore).
3. Mở database vừa tạo, ghi lại 2 thông tin:
   - **Database URL** — có dạng `libsql://fintech-vault-<tên-của-bạn>.turso.io`
   - **Token** — bấm **Create Token / Generate Token**, chọn không hết hạn (*No expiration*) và quyền đọc ghi (*Read & Write*), rồi sao chép chuỗi token.

> 🔒 Token giống như mật khẩu của database: **không** dán vào code, **không** commit lên GitHub.

Bạn không cần tạo bảng: backend tự tạo bảng ở lần chạy đầu tiên.

---

## Bước 2 — Deploy backend lên Render

Repo đã có sẵn file `render.yaml` nên Render tự cấu hình gần hết.

1. Vào **https://render.com** → đăng nhập bằng GitHub.
2. Bấm **New +** → **Blueprint**.
3. Chọn repo `expense-management-web` (nếu không thấy, bấm cấp quyền cho Render truy cập repo).
4. Render đọc `render.yaml` và hỏi giá trị cho 3 biến. Điền:

   | Biến | Giá trị |
   | --- | --- |
   | `TURSO_DATABASE_URL` | Database URL ở Bước 1 (`libsql://...`) |
   | `TURSO_AUTH_TOKEN` | Token ở Bước 1 |
   | `CORS_ORIGIN` | Địa chỉ trang Vercel của bạn, vd `https://expense-management-web-eight.vercel.app` (không có `/` ở cuối) |

5. Bấm **Apply / Deploy** và chờ vài phút đến khi trạng thái là **Live**.
6. Sao chép địa chỉ backend ở đầu trang service, vd `https://fintech-vault-api.onrender.com`.
7. **Kiểm tra:** mở `https://<địa-chỉ-backend>/api/health` trên trình duyệt. Phải thấy:
   ```json
   {"ok":true,"database":"libsql"}
   ```
   - `"database":"libsql"` nghĩa là đã kết nối Turso. ✅
   - Nếu thấy `"database":"sqlite"` thì backend **chưa** nhận biến Turso (dữ liệu sẽ bị mất). Vào **Environment** của service kiểm tra lại 2 biến `TURSO_*`, rồi **Manual Deploy**.

---

## Bước 3 — Nối giao diện trên Vercel với backend

1. Vào **https://vercel.com** → mở project `expense-management-web`.
2. **Settings** → **Environment Variables** → thêm:

   | Key | Value |
   | --- | --- |
   | `VITE_API_URL` | Địa chỉ backend ở Bước 2, vd `https://fintech-vault-api.onrender.com` (không có `/` ở cuối) |

3. Vào tab **Deployments** → bấm `⋯` ở bản mới nhất → **Redeploy**.
   (Biến `VITE_*` được gắn vào lúc build, nên **phải build lại** thì mới có tác dụng.)

File `vercel.json` trong repo đã chỉ cho Vercel build thư mục `client/`, bạn không cần đổi cài đặt nào khác.

---

## Bước 4 — Kiểm tra lần cuối

1. Mở trang Vercel → đăng nhập bằng `admin@gmail.com / 123456` hoặc **Tạo tài khoản** mới.
2. Thêm vài giao dịch.
3. Trên Render, bấm **Manual Deploy → Restart service** (giả lập server khởi động lại).
4. Tải lại trang web → dữ liệu vẫn còn nguyên. 🎉

---

## Sửa lỗi thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| "Không kết nối được máy chủ" | Chờ khoảng 1 phút (server đang thức dậy) rồi thử lại. Kiểm tra `VITE_API_URL` trên Vercel đúng địa chỉ Render và đã **Redeploy**. Mở `/api/health` của backend xem có chạy không. |
| Console trình duyệt báo lỗi **CORS** | `CORS_ORIGIN` trên Render phải **trùng chính xác** địa chỉ trang Vercel (có `https://`, không có `/` cuối). Nhiều địa chỉ thì cách nhau bằng dấu phẩy. Sửa xong bấm **Manual Deploy**. |
| `/api/health` báo `"database":"sqlite"` | Thiếu `TURSO_DATABASE_URL` hoặc `TURSO_AUTH_TOKEN` trên Render (xem Bước 2.7). |
| Render báo lỗi kết nối Turso / `401` | Token sai hoặc đã hết hạn → tạo token mới ở Turso, cập nhật `TURSO_AUTH_TOKEN`. |
| Render build lỗi liên quan `package-lock.json` | Chạy `npm install` trên máy, commit file `package-lock.json` rồi push lại. |

## Tuỳ chọn

- **Tắt tài khoản demo** (khi không muốn ai cũng đăng nhập được bằng `admin@gmail.com`): trên Render thêm biến `SEED_DEMO=false`. Hoặc giữ demo nhưng đổi mật khẩu bằng biến `DEMO_PASSWORD`.
- **Xem dữ liệu trong database:** trang quản lý Turso có mục chỉnh sửa và chạy SQL (vd `SELECT * FROM users;`).
