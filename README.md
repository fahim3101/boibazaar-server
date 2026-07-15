# BoiBazaar Server (Backend API)

Express + TypeScript + MongoDB + JWT backend for BoiBazaar, a used textbook exchange
platform for university students.

## Tech Stack
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose
- JWT authentication + bcrypt password hashing

## Local Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your own values:
   ```
   cp .env.example .env
   ```
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your frontend URL (http://localhost:3000 for local dev)

### Troubleshooting: "querySrv ENOTFOUND" / MongoDB won't connect

Some ISPs and routers (a known recurring issue in Bangladesh) fail to resolve
the SRV/TXT DNS records that `mongodb+srv://` connection strings depend on.
`src/config/db.ts` already forces Node to use Google's public DNS (8.8.8.8) to
work around this — no extra setup needed in most cases.

If it still fails, get the **non-SRV** connection string instead:
1. In Atlas, go to your cluster → **Connect** → **Drivers**
2. Click **"See full connection string"** or select an older driver version —
   Atlas will show a `mongodb://` string with three explicit hosts
   (e.g. `mongodb://shard-00-00.xxx.mongodb.net:27017,shard-00-01...`) instead
   of the single `mongodb+srv://cluster.mongodb.net` host.
3. Paste that full string into `MONGO_URI` in your `.env` — this skips SRV
   lookup entirely since it doesn't rely on the SRV record at all.

3. Seed demo data (creates a demo user, a demo admin, and 8 sample book listings):
   ```
   npm run seed
   ```
   Demo user login: `demo@boibazaar.com` / `Demo1234!`
   Demo admin login: `admin@boibazaar.com` / `Admin1234!` (unlocks the Admin Panel link in the navbar)

4. Run the dev server:
   ```
   npm run dev
   ```
   Server runs at http://localhost:5000

## API Endpoints

| Method | Route                    | Access  | Description                     |
|--------|---------------------------|---------|----------------------------------|
| POST   | /api/auth/register        | Public  | Register new user                |
| POST   | /api/auth/login           | Public  | Log in, returns JWT              |
| POST   | /api/auth/social           | Public  | Google/Facebook login via Firebase ID token |
| GET    | /api/auth/me               | Private | Get current logged-in user       |
| GET    | /api/books                 | Public  | List books (search/filter/sort/pagination) |
| GET    | /api/books/mine             | Private | Get logged-in user's own listings |
| GET    | /api/books/:id              | Public  | Get single book + related books  |
| POST   | /api/books                  | Private | Create a new listing             |
| DELETE | /api/books/:id              | Private | Delete own listing               |
| POST   | /api/books/:id/reviews       | Private | Add a review to a book           |
| GET    | /api/admin/stats             | Admin   | Platform-wide totals              |
| GET    | /api/admin/books              | Admin   | View every listing (any seller)   |
| GET    | /api/admin/users              | Admin   | View every registered user         |
| DELETE | /api/admin/books/:id           | Admin   | Remove any listing (moderation)   |

## Deploying to Vercel

1. Push this folder to its own GitHub repo (e.g. `boibazaar-server`).
2. Go to https://vercel.com/new and import that repo.
3. In the Vercel project settings, add Environment Variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL` (your deployed frontend URL)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
     (from your Firebase service account JSON — see the main setup guide)
4. Deploy. Vercel will use `vercel.json` to run the Express app as a serverless function.
5. Your API will be live at `https://your-project-name.vercel.app`
