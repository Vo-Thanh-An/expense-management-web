# 💸 FINTECH VAULT — Personal Expense Management Web App

A modern full-stack personal finance and expense tracking web application built with **React + Vite**, **Tailwind CSS** and a **Node.js + SQLite** REST API. It enables users to monitor income and expenses, analyze month-over-month spending trends, manage category budgets, and track savings vaults.

🔗 **Live Demo:** [https://expense-management-web-eight.vercel.app/](https://expense-management-web-eight.vercel.app/)

---

## ✨ Key Features

- **User Authentication:** Register / login with scrypt-hashed passwords and revocable server-side sessions (Bearer token), profile editing, password change and brute-force protection.
- **Command Center (Dashboard):** Displays an interactive virtual asset card, total income/expenses, savings rate, and top spending highlights.
- **Transaction Ledger:** Add, edit, delete, search, and filter financial records by transaction type (Income/Expense) and category.
- **Monthly Analytics & Comparison:** Visualizes category-level expense breakdowns and automatically calculates month-over-month growth percentages.
- **Budgets & Savings Vaults:** Editable monthly spending limits per category with over-budget alerts; create / delete savings goals and deposit any amount (the server checks the available balance and records the deposit in the ledger).
- **Persistent Storage & Backup:** All data is stored per user in SQLite locally or in a [Turso](https://turso.tech) cloud database in production, with one-click `.json` export and demo data reset.

---

## 🛠️ Tech Stack

- **Frontend:** React (JavaScript), Vite
- **Styling:** Tailwind CSS v4, Custom CSS Micro-interactions
- **Icons:** Lucide React
- **Backend:** Node.js 22 (`node:http`, `node:crypto`), single dependency `@libsql/client`
- **Database:** SQLite (`node:sqlite`) locally, Turso (libSQL) in production
- **Deployment:** Vercel (UI) + Render (API) + Turso (database) — all on free plans

---

## 🚀 Getting Started

Requires **Node.js ≥ 22.13**. The repo is an npm workspace (`client` + `server`), so one install at the root is enough.

```bash
npm install

# Terminal 1 — API on http://localhost:4000
npm run dev:server

# Terminal 2 — UI on http://localhost:5173 (requests to /api are proxied to the API)
npm run dev
```

On first start the API creates a demo account **admin@gmail.com / 123456** with sample data
(disable with `SEED_DEMO=false`). The database file lives at `server/data/fintech-vault.db`.

| Command (run at the root) | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server for the UI |
| `npm run dev:server` | Start the API with auto-reload |
| `npm run build` | Build the UI into `client/dist/` |
| `npm start` | Start the API (also serves `client/dist/` if it exists) |
| `npm test` | Run the API test suite (against both the SQLite and the Turso adapter) |
| `npm run lint` | Lint the UI with oxlint |

### Single-server production build

```bash
npm run build
npm start       # open http://localhost:4000
```

### Environment variables

Copy `.env.example` to `.env` at the project root (it is read by both the UI and the API).

| Variable | Used by | Description |
| --- | --- | --- |
| `VITE_API_URL` | UI | API base URL when the UI is hosted separately (e.g. on Vercel). Leave empty locally. |
| `PORT` | API | Port to listen on (default `4000`). |
| `TURSO_DATABASE_URL` | API | Turso database URL (`libsql://…`). When set, the API uses Turso instead of a local file. |
| `TURSO_AUTH_TOKEN` | API | Turso auth token. |
| `DB_PATH` | API | SQLite file path when Turso is not configured (default `server/data/fintech-vault.db`). |
| `CORS_ORIGIN` | API | Allowed origins, comma-separated, or `*` (default). |
| `SEED_DEMO` | API | `false` to skip creating the demo account. |

### Deployment

👉 **Step-by-step guide (Vietnamese): [DEPLOY.md](./DEPLOY.md)**

In short: create a Turso database, deploy the API to Render with the included `render.yaml`
(`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CORS_ORIGIN`), then set `VITE_API_URL` on Vercel and redeploy.

---
## 📡 REST API

All endpoints except register/login/health require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| `POST` | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| `POST` | `/api/auth/logout` | Revoke the current token |
| `GET` / `PATCH` | `/api/auth/me` | Get / update profile (`{ name }`) |
| `POST` | `/api/auth/change-password` | `{ currentPassword, newPassword }` |
| `GET` | `/api/bootstrap` | User, transactions, goals and budgets in one call |
| `GET` / `POST` | `/api/transactions` | List / create `{ type, category, amount, date, note }` |
| `PUT` / `DELETE` | `/api/transactions/:id` | Update / delete a transaction |
| `GET` / `POST` | `/api/goals` | List / create `{ name, target, icon, color }` |
| `DELETE` | `/api/goals/:id` | Delete a goal (its in-app deposits are refunded to the balance) |
| `POST` | `/api/goals/:id/deposit` | `{ amount }` — move money from the balance into a goal |
| `GET` | `/api/budgets` | `{ [category]: amount }` |
| `PUT` | `/api/budgets/:category` | `{ amount }` — set a monthly limit |
| `POST` | `/api/demo/reset` | Replace the user's data with the sample data |

---

## 📁 Project Structure

```
expense-management-web/
├── client/                      # Frontend — React + Vite + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── api/client.js        # fetch wrapper for the REST API
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, MobileNav, Header
│   │   │   ├── modals/          # TransactionModal, GoalModal
│   │   │   └── ui/              # Modal, Toast, LoadingScreen
│   │   ├── config/navigation.js # menu items
│   │   ├── hooks/
│   │   │   ├── useToast.js
│   │   │   └── useVault.js      # session + data + actions (calls the API)
│   │   ├── pages/               # Login, Overview, Ledger, Analytics, Budgets, Settings
│   │   ├── utils/               # formatting & financial calculations
│   │   ├── App.jsx              # layout, routing between pages, modals
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js           # @shared alias, dev proxy /api → :4000
├── server/                      # Backend — Node.js + SQLite / Turso
│   ├── src/
│   │   ├── auth/                # password hashing, sessions, login rate limiter
│   │   ├── db/
│   │   │   ├── adapters/        # sqlite.js (local file), libsql.js (Turso)
│   │   │   ├── database.js      # schema + picks the adapter
│   │   │   ├── queries.js       # shared read queries
│   │   │   └── seed.js          # demo account & sample data
│   │   ├── lib/                 # router & HTTP helpers, validation, static files
│   │   ├── routes/              # auth, transactions, goals, budgets, system
│   │   ├── app.js               # wires routes together
│   │   ├── config.js            # environment variables
│   │   └── index.js             # entry point
│   └── tests/                   # one API suite, run against both adapters
├── shared/categories.js         # categories used by both client and server
├── .env.example
├── DEPLOY.md                    # deployment guide
├── render.yaml                  # Render blueprint for the API
├── vercel.json
└── package.json                 # npm workspaces + root scripts
```
