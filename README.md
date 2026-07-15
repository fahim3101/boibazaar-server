# BoiBazaar — Backend API

Express + TypeScript + MongoDB backend powering **BoiBazaar**, a peer-to-peer
marketplace where university students in Bangladesh buy and sell secondhand
textbooks and study materials.

**Live API:** https://boibazaar-server.vercel.app
**Frontend repo:** [boibazaar-client](https://github.com/fahim3101/boibazaar-client)

## Features

- JWT-based authentication (register/login) with bcrypt password hashing
- Google & Facebook social login via Firebase Admin SDK
- Role-based authorization (`user` / `admin`)
- Full CRUD for book listings with ownership checks
- Search, multi-field filtering, sorting, and pagination
- Reviews & ratings per listing
- Admin endpoints for platform-wide moderation

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt, Firebase Admin SDK (social login) |
| Deployment | Vercel (serverless functions) |

## Project Structure

```
server/
├── src/
│   ├── config/          # DB connection, Firebase Admin init
│   ├── controllers/     # Route handlers (auth, books, admin)
│   ├── middleware/       # JWT auth guard, admin guard, error handler
│   ├── models/           # Mongoose schemas (User, Book)
│   ├── routes/           # Express routers
│   ├── seed/             # Demo data seed script
│   └── index.ts          # App entry point
├── vercel.json
└── package.json
```

## Environment Variables

`.env` fill in:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string, including database name |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `PORT` | Local dev port (ignored on Vercel) |
| `CLIENT_URL` | Deployed frontend URL (for CORS) |
| `FIREBASE_PROJECT_ID` | From Firebase service account JSON |
| `FIREBASE_CLIENT_EMAIL` | From Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | From Firebase service account JSON (keep the `\n` escapes) |

## Local Setup

```bash
npm install
cp .env.example .env   # then fill in the values above
npm run seed            # creates demo user, demo admin, and 8 sample listings
npm run dev              # runs on http://localhost:5000
```

**Demo credentials (created by the seed script):**
| Role | Email | Password |
|---|---|---|
| Student | `demo@boibazaar.com` | `Demo1234!` |
| Admin | `admin@boibazaar.com` | `Admin1234!` |

## API Reference

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with name/email/password |
| POST | `/login` | Public | Log in, returns JWT |
| POST | `/social` | Public | Google/Facebook login via Firebase ID token |
| GET | `/me` | Private | Get the logged-in user |

### Books — `/api/books`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List books — supports `search`, `subject`, `condition`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| GET | `/mine` | Private | Get the logged-in user's own listings |
| GET | `/:id` | Public | Get one listing + related listings |
| POST | `/` | Private | Create a listing |
| DELETE | `/:id` | Private | Delete your own listing |
| POST | `/:id/reviews` | Private | Add a review |

### Admin — `/api/admin`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform-wide totals |
| GET | `/books` | Admin | View every listing, any seller |
| GET | `/users` | Admin | View every registered user |
| DELETE | `/books/:id` | Admin | Remove any listing (moderation) |

## Deployment (Vercel)

1. Push this repo to GitHub, import it at [vercel.com/new](https://vercel.com/new)
2. Add all environment variables listed above in the Vercel project settings
3. Deploy — `vercel.json` runs the Express app as a serverless function
4. After the frontend is deployed too, update `CLIENT_URL` here and redeploy

## Troubleshooting

**`querySrv ENOTFOUND` locally:** some Bangladeshi ISPs fail to resolve the
`mongodb+srv://` SRV DNS record. `src/config/db.ts` automatically forces
Node to use Google DNS (8.8.8.8) — but only outside of Vercel, since Vercel's
own network doesn't have this issue.

**500 `FUNCTION_INVOCATION_FAILED`:** the DB connection logic never calls
`process.exit()`, since that would crash the whole serverless function on
every request. Connection failures are logged and returned as normal error
responses instead.

## Author
Built by **MD Fahim Rana** — [GitHub](https://github.com/fahim3101) · [LinkedIn](https://linkedin.com/in/fahim-rana)