# Task Manager – Server

Node.js + Express + MongoDB (Mongoose) + TypeScript REST API.

## Setup

```bash
npm install
cp .env.example .env     # fill in MONGODB_URI and JWT_SECRET
npm run dev              # http://localhost:5000
```

Production (long-running host such as Render/Railway): `npm run build && npm start`

### Vercel

Vercel's zero-config Express support loads `src/app.ts`, which default-exports the app
(`src/server.ts` is only used for local/long-running hosts). Do not add `api/` or rewrites.
Set these environment variables on the Vercel project: `MONGODB_URI`, `JWT_SECRET` (16+ chars),
`CLIENT_ORIGIN` (the deployed client URL, no trailing slash). In MongoDB Atlas > Network Access,
allow `0.0.0.0/0` (Vercel's IPs are dynamic). `GET /health` never touches the database, so use it
to tell "function crashed" apart from "database unreachable".

## Architecture

`routes → middleware (auth, zod validation) → controllers → services → models`

- Controllers are thin; business logic and queries live in services.
- Every task query is scoped by the authenticated user's id.
- All errors use one shape: `{ "error": { "code", "message", "details?" } }`.
- Indexes: `{ user, status, dueDate }` and `{ user, createdAt: -1 }`.

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Health check |
| POST | `/api/auth/register` | no | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | no | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/tasks` | yes | Query: `status, priority, q, sort, page, limit` |
| POST | `/api/tasks` | yes | `{ title, description?, status?, priority?, dueDate? }` |
| GET | `/api/tasks/:id` | yes | Single task |
| PATCH | `/api/tasks/:id` | yes | Partial update (`dueDate: null` clears it) |
| DELETE | `/api/tasks/:id` | yes | Delete (204) |

Send `Authorization: Bearer <token>` on protected routes.

List response: `{ "data": [...], "meta": { "page", "limit", "total", "totalPages" } }`

`sort` is one of `createdAt`, `-createdAt` (default), `dueDate`, `-dueDate`.

## Quick test

```bash
curl -X POST localhost:5000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"password123"}'

TOKEN=<paste token>

curl -X POST localhost:5000/api/tasks -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write README","priority":"high","dueDate":"2026-11-25"}'

curl "localhost:5000/api/tasks?status=todo&sort=dueDate" -H "Authorization: Bearer $TOKEN"
```

## Known limitation

Auth uses a single access token with no refresh rotation or server-side revocation.
