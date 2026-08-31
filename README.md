<p align="center">
  <h1 align="center">📚 BoiBazaar — Backend API</h1>
  <p align="center">Express + TypeScript + MongoDB backend for the student textbook marketplace</p>
  <p align="center">
    <em>Peer-to-peer textbooks, zero bookstore markup.</em>
  </p>
</p>

<p align="center">
  <a href="https://boibazaar-server.vercel.app"><img src="https://img.shields.io/badge/Live%20API-BoiBazaar-3F6659?style=for-the-badge&logo=express" alt="Live API" /></a>
  <a href="https://boibazaar-client.vercel.app"><img src="https://img.shields.io/badge/Live%20Client-BoiBazaar-1B2A4A?style=for-the-badge&logo=vercel" alt="Live Client" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-green?logo=node.js" alt="Node" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript" alt="TS" />
  <img src="https://img.shields.io/badge/Express-4.19-lightgrey?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb" alt="Mongo" />
  <img src="https://img.shields.io/badge/Tests-Jest%20%7C%20ts--jest-red?logo=jest" alt="Jest" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="https://boibazaar-server.vercel.app">🔗 Live API</a> •
  <a href="https://boibazaar-client.vercel.app">🌐 Live Client</a> •
  <a href="https://github.com/fahim3101/boibazaar-client">💻 Frontend Repo</a>
</p>

---

## ✨ Features

- 🔐 **Auth** — JWT (`bcrypt` hash) + Firebase Admin (Google/Facebook social `POST /auth/social`)
- 👥 **RBAC** — `user` / `admin` middleware (`requireAdmin`)
- 📚 **Books CRUD** — Ownership checks, `DELETE` own or admin any
- 🔍 **Discovery** — `search` (regex on title/author/subject), filter `subject/condition/minPrice/maxPrice`, sort `newest/price/rating`, pagination `page/limit`
- ⭐ **Reviews** — Per-listing `rating 1-5` + comment, auto `avgRating`
- 🛠️ **Admin** — `/admin/stats`, `/admin/books`, `/admin/users`, moderation `DELETE /admin/books/:id`

---

## 🧭 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Local Setup](#-local-setup)
- [Quality & Testing](#-quality--testing)
- [Analytics & Performance](#-analytics--performance)
- [API Reference](#-api-reference)
- [Deployment](#️-deployment)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)

---

## 🧰 Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Runtime    | Node.js + Express.js                                           |
| Language   | TypeScript (`strict: true`, `module: commonjs`)                |
| Database   | MongoDB + Mongoose (text index on title/author/subject)        |
| Auth       | JWT (`jsonwebtoken` + 7d) + `bcryptjs` + Firebase Admin SDK    |
| Logging    | Morgan `tiny` (Vercel logs, complements Analytics)             |
| Testing    | Jest + ts-jest + Supertest (8 tests)                           |
| Quality    | ESLint (`@typescript-eslint`) + Prettier + Husky + lint-staged |
| Deployment | Vercel Serverless (`vercel.json` → `src/index.ts`)             |

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.ts              # mongoose + DNS fix (8.8.8.8 outside Vercel)
│   │   └── firebaseAdmin.ts   # Admin SDK init (private_key with \n)
│   ├── controllers/
│   │   ├── authController.ts  # register/login/social/me
│   │   ├── bookController.ts  # getBooks/mine/byId/create/delete/addReview
│   │   └── adminController.ts # stats/books/users/delete
│   ├── middleware/
│   │   ├── auth.ts            # JWT verify (Bearer)
│   │   ├── requireAdmin.ts    # role === admin
│   │   └── errorHandler.ts    # 500 + 404 notFound
│   ├── models/
│   │   ├── User.ts            # email unique, bcrypt pre-save
│   │   └── Book.ts            # subject/condition enum, avgRating index
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── bookRoutes.ts
│   │   └── adminRoutes.ts
│   ├── utils/
│   │   ├── generateToken.ts   # jwt.sign 7d
│   │   └── __tests__/         # Jest (generateToken 4, errorHandler 4)
│   ├── seed/seed.ts           # 8 books + demo/admin users
│   └── index.ts               # cors + json + morgan + connectDB per request + VERCEL guard
├── jest.config.js
├── vercel.json                 # { builds: @vercel/node, routes: /(.*) -> dist/index.js }
└── package.json
```

---

## 🔐 Environment Variables

Create `.env` in `server/` (never commit):

```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/boibazaar?retryWrites=true&w=majority
JWT_SECRET=your-super-long-random-string-min-32chars
PORT=5000
CLIENT_URL=http://localhost:3000,https://boibazaar-client.vercel.app
FIREBASE_PROJECT_ID=boibazaar-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@boibazaar-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n"
```

| Variable     | Notes                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| `MONGO_URI`  | Atlas → Connect → Drive → `+srv` string, include DB name `boibazaar`       |
| `JWT_SECRET` | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | Comma-separated for CORS (`split(",")` in `src/index.ts:15`)               |
| `FIREBASE_*` | Firebase → Project Settings → Service accounts → Generate new private key  |

> Vercel: Add same vars in Project → Settings → Environment Variables (Production + Preview).

---

## 🚀 Local Setup

```bash
# 1. Install
npm install

# 2. Env (see table above)
cp .env.example .env   # or create manually
# - fill MONGO_URI, JWT_SECRET, FIREBASE_*; PORT optional

# 3. Seed demo data (creates 8 books + 2 users)
npm run seed
# ✔ Demo user  demo@boibazaar.com / Demo1234!
# ✔ Demo admin admin@boibazaar.com / Admin1234!

# 4. Dev (ts-node-dev, respawn, transpile-only)
npm run dev
# BoiBazaar server running on http://localhost:5000
# MongoDB connected successfully.

# 5. Build check
npm run build && npm start
```

**Test the API:**

```bash
curl http://localhost:5000/
# {"message":"BoiBazaar API is running."}

curl "http://localhost:5000/api/books?search=calculus&subject=Mathematics&sort=price_low"
```

---

## 🧪 Quality & Testing

```bash
npm run lint           # eslint src --ext .ts  (warn on any, off console)
npm run lint:fix       # --fix
npm run format         # prettier --write "src/**/*.{ts,js,json}"
npm run format:check   # CI check
npm test               # jest (8 passed)
npm run test:watch     # --watch
npm run test:coverage  # --coverage (src, !seed !config)
npm run build          # tsc -p tsconfig.json -> dist/
```

- **Husky pre-commit** (`.husky/pre-commit` → `npx lint-staged`): staged `src/**/*.{ts,js,json}` gets `eslint --fix` + `prettier --write` before commit.
- **Tests:** `jest.config.js:3` (`preset ts-jest`, `roots src`, `collectCoverageFrom !seed !config`). Covers `generateToken` (JWT structure, payload, 7d diff, uniqueness) and `errorHandler` (500/404/default message).
- **Type safety:** `tsconfig.json` `strict: true`, `module: commonjs`, `moduleResolution: node` (fixed TS5095 bundler error), `esModuleInterop`.

---

## 📈 Analytics & Performance

- **Logging:** `src/index.ts:21` `morgan("tiny")` (disabled when `NODE_ENV=test`) — `GET /api/books?search=... 200 45 - 12.345 ms` in Vercel Runtime Logs. Frontend side has Vercel Analytics + Speed Insights.
- **Serverless-ready:** `src/index.ts:24` `app.use(async (req,_,next)=>{await connectDB(); next();})` reuses `isConnected` flag, `serverSelectionTimeoutMS:15000`. No `process.exit()` (would kill serverless function).
- **DNS fix:** `src/config/db.ts:10` `if(!process.env.VERCEL) dns.setServers(["8.8.8.8","8.8.4.4"])` — fixes `querySrv ENOTFOUND` on Bangladeshi ISPs, skipped on Vercel.
- **CORS:** `CLIENT_URL?.split(",") || true` supports localhost + prod multi-domains.

---

## 📚 API Reference

Base: `http://localhost:5000` prod: `https://boibazaar-server.vercel.app`

### Auth — `/api/auth`

| Method | Route       | Access  | Body / Header                              | Description                          |
| ------ | ----------- | ------- | ------------------------------------------ | ------------------------------------ |
| POST   | `/register` | Public  | `{name,email,password,university?,phone?}` | `201 {user,token}` bcrypt hash       |
| POST   | `/login`    | Public  | `{email,password}`                         | `200 {user,token}`                   |
| POST   | `/social`   | Public  | `{idToken}` (Firebase ID token)            | Verifies via Admin SDK, upserts user |
| GET    | `/me`       | Private | `Authorization: Bearer <JWT>`              | `200 {user}` via `auth` middleware   |

**Example:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Fahim","email":"test@test.com","password":"Test1234!"}'
```

### Books — `/api/books`

| Method | Route          | Access  | Query / Body                                                                                      | Description                              |
| ------ | -------------- | ------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| GET    | `/`            | Public  | `?search=&subject=&condition=&minPrice=&maxPrice=&sort=newest                                     | price_low                                | price_high | rating&page=1&limit=8` | `200 {books,total,page,pages}` paginated |
| GET    | `/mine`        | Private | `Bearer`                                                                                          | Own listings `200 {books}`               |
| GET    | `/:id`         | Public  | —                                                                                                 | `200 {book,related: Book[4]}` by subject |
| POST   | `/`            | Private | `{title,author,subject,condition,price,shortDescription,fullDescription,location,university,...}` | `201 {book}`                             |
| DELETE | `/:id`         | Private | `Bearer`                                                                                          | Owner only `200 {message}`               |
| POST   | `/:id/reviews` | Private | `{rating 1-5,comment,userName}`                                                                   | `201 {book}` recalculates `avgRating`    |

### Admin — `/api/admin` (requires `role: admin`)

| Method | Route        | Access | Description                                          |
| ------ | ------------ | ------ | ---------------------------------------------------- |
| GET    | `/stats`     | Admin  | `200 {totalBooks,totalUsers,totalAdmins, avgPrice?}` |
| GET    | `/books`     | Admin  | All listings any seller                              |
| GET    | `/users`     | Admin  | All users                                            |
| DELETE | `/books/:id` | Admin  | Moderation - delete any                              |

---

## ☁️ Deployment (Vercel)

1. Push to GitHub → Import at [vercel.com/new](https://vercel.com/new) → Select `server` folder (or root if monorepo, set `Root Directory: server`)
2. Framework Preset: `Other`, Build Command: `npm run build`, Output: `dist`
3. **Env Vars:** Add all `MONGO_URI` etc. in Vercel → Settings → Environment Variables
4. Deploy → `vercel.json` routes `/(.*)` → `dist/index.js` as serverless function
5. After client deploy, update `CLIENT_URL` to `https://boibazaar-client.vercel.app,http://localhost:3000` and Redeploy

---

## 🛠 Troubleshooting

<details>
<summary><strong>querySrv ENOTFOUND</strong> on local ISP</summary>

Some Bangladeshi ISPs fail to resolve `mongodb+srv://` SRV. `src/config/db.ts:10` does `dns.setServers(["8.8.8.8"])` only when `!process.env.VERCEL` (Vercel sandbox blocks it). If still fails, switch to mobile data or `1.1.1.1`.

</details>

<details>
<summary><strong>FUNCTION_INVOCATION_FAILED 500</strong> on Vercel</summary>

We never `process.exit()` on DB fail (`src/config/db.ts:34` just `console.error`). Check Vercel → Logs → `MongoDB connection failed` → verify `MONGO_URI` (IP allowlist `0.0.0.0/0`, correct `?retryWrites`) and `FIREBASE_PRIVATE_KEY` keeps `\n` escapes (wrap in `"..."`).

</details>

<details>
<summary><strong>CORS blocked</strong></summary>

`src/index.ts:15` reads `CLIENT_URL.split(",")`. Ensure it includes your Vercel client domain exactly (no trailing `/`). Try `CLIENT_URL=*` temporarily for debug, then lock down.

</details>

---

## 👤 Author

<p align="center">
  <strong>MD Fahim Rana</strong> — Full-Stack (Next.js / Express / MongoDB)<br/>
  <a href="https://github.com/fahim3101">GitHub</a> • <a href="https://linkedin.com/in/fahim-rana">LinkedIn</a> • <a href="mailto:fahimrana3101@gmail.com">fahimrana3101@gmail.com</a><br/>
  Dhaka, Bangladesh
</p>

<p align="center">
  <em>Star ⭐ the repo if you find it useful — it motivates open-source!</em>
</p>

---

> **Crafted for students.** Dhaka · Chattogram · Sylhet · Rajshahi — one connection at a time. Next step: wishlist, chat, order tracking?
