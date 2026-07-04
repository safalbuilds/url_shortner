# Backend Development with TypeScript — Notes

> Beginner-friendly notes for someone who has just started JavaScript and is building their first real backend (e.g. a URL shortener with Express + PostgreSQL).

---

## 1. What is a Backend?

Think of an app like a restaurant. The **frontend** is the dining room — what the customer sees and interacts with (menu, tables, waiter). The **backend** is the kitchen — it's where the actual work happens: ingredients (data) are fetched, prepared (processed), and sent back out as a finished dish (response).

A backend:
- Receives requests from clients (browser/mobile app)
- Processes data and applies business rules
- Talks to the database
- Sends a response back

```
Browser
   |
HTTP Request
   |
Express Server
   |
Service
   |
Repository
   |
PostgreSQL
   |
HTTP Response
```

**Why it's split into layers:** if everything lived in one giant file, a bug in "talking to the database" could be tangled up with "deciding business rules." Layers let you change one part (e.g. swap PostgreSQL for MySQL) without rewriting everything else.

---

## 2. Why TypeScript?

TypeScript is JavaScript with **types** — labels that tell you (and your editor) what kind of value a variable is supposed to hold.

```ts
const age: number = 20;
const name: string = "Safal";
```

Plain JavaScript won't stop you from doing something like `age + name` and getting a weird result at runtime. TypeScript catches this **while you're writing code**, before it ever runs — like a spell-checker for your logic, not just your data.

Common types you'll see constantly:

```ts
let id: number;
let username: string;
let isActive: boolean;
let tags: string[];          // array of strings
let user: { id: number; name: string }; // object shape
```

---

## 3. Project Structure

```text
src/
├── config/
├── controllers/
├── errors/
├── lib/
├── middleware/
├── repositories/
├── routes/
├── schemas/
├── services/
├── utils/
├── app.ts
└── index.ts
```

A simple mental model: **routes decide *where*, controllers decide *what to respond with*, services decide *what should happen*, repositories decide *how to talk to the database*.**

| Folder | Responsibility | Analogy |
|---|---|---|
| `config/` | Environment variables, app-wide settings | The restaurant's operating rules |
| `controllers/` | Receive HTTP requests, return HTTP responses. Keep these **thin** — no business logic here. | The waiter taking your order and bringing your food |
| `services/` | Business logic — e.g. generate a short code, decide if a URL has expired | The chef deciding *how* to cook |
| `repositories/` | ONLY database queries, nothing else | The person who fetches ingredients from the pantry |
| `routes/` | Maps URL paths to controllers | The restaurant's table numbers/menu sections |
| `middleware/` | Code that runs before/after controllers (e.g. `express.json()`, rate limiting, error handling) | Security checking your reservation before you're seated |
| `schemas/` | Validation rules, usually with Zod | The order form that rejects nonsense orders |
| `utils/` | Small, reusable helper functions with no dependencies on the rest of the app | A shared toolbox |
| `lib/` | Creates shared objects, like the PostgreSQL connection pool | The kitchen's shared equipment |
| `errors/` | Custom error classes | Standardized "something went wrong" tickets |

**Why keep controllers thin?** If a controller does validation, business logic, *and* database queries, it becomes impossible to test or reuse. Thin controllers just: (1) grab data from the request, (2) call a service, (3) send a response.

---

## 4. app.ts vs index.ts

### app.ts
Creates and **configures** Express — middleware, routes, error handling. It does not start listening on a port.

```ts
const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

export default app;
```

### index.ts
**Starts** the server.

```ts
import app from "./app";

app.listen(PORT);
```

**Why separate these?** In tests, you often want to send fake requests to your app *without* actually opening a network port. If `app.ts` only builds the app and `index.ts` starts it, your test files can import `app.ts` directly and skip `index.ts` entirely.

---

## 5. Express Basics

Create app:
```ts
const app = express();
```

Parse incoming JSON bodies (without this, `req.body` is `undefined`):
```ts
app.use(express.json());
```

Start server:
```ts
app.listen(3000);
```

Create a router (a mini, mountable version of your app):
```ts
const router = Router();
```

**Reading data from a request:**
```ts
req.body    // data sent in the request body (e.g. JSON from a POST)
req.params  // values from the URL path, e.g. /users/:id -> req.params.id
req.query   // values after the ? in a URL, e.g. /search?term=cat -> req.query.term
```

**Sending a response:**
```ts
res.json({ message: "success" }); // send JSON
res.status(200);                  // set the HTTP status code
res.redirect("https://example.com"); // redirect the client elsewhere
```

**Quick example — put it together:**
```ts
router.get("/urls/:code", async (req, res) => {
  const { code } = req.params;
  const url = await urlService.findByCode(code);
  res.status(200).json(url);
});
```

---

## 6. Request Flow

```
Client
  ↓  (HTTP request)
Route            — "which handler does this URL match?"
  ↓
Controller       — "grab input, call the right service, shape the response"
  ↓
Service          — "apply business rules"
  ↓
Repository       — "run the actual SQL query"
  ↓
Database
  ↑
Repository       — returns raw rows
  ↑
Service          — turns raw rows into something meaningful
  ↑
Controller       — sends the final response
  ↑
Client
```

Data flows down, then the result flows back up through the *same* layers — never skipping one (e.g. a controller should never query the database directly).

---

## 7. PostgreSQL Basics

Hierarchy: **Database → Tables → Rows → Columns**

Example table:
```sql
CREATE TABLE urls(
 id SERIAL PRIMARY KEY,
 original_url TEXT,
 short_code VARCHAR(10),
 created_at TIMESTAMP,
 expires_on TIMESTAMP
);
```

- `SERIAL PRIMARY KEY` — auto-incrementing unique ID (1, 2, 3, …)
- `TEXT` — unlimited-length string
- `VARCHAR(10)` — string capped at 10 characters
- `TIMESTAMP` — a date + time

Useful SQL:
```sql
SELECT * FROM urls;
INSERT INTO urls(original_url, short_code) VALUES ('https://x.com', 'abc123');
UPDATE urls SET expires_on = NOW() WHERE id = 1;
DELETE FROM urls WHERE id = 1;
```

---

## 8. The `pg` Library

Create a connection pool (a reusable set of open database connections — opening a new connection per request is slow, so we keep a "pool" ready):
```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

Run a query:
```ts
await pool.query(
 "SELECT * FROM urls WHERE short_code=$1",
 [code]
);
```

`$1` is a **placeholder**. Instead of gluing `code` directly into the SQL string, you pass it separately — this prevents **SQL injection**, where a malicious user could type something like `'; DROP TABLE urls; --` into an input field and have it executed as real SQL.

❌ Never do this:
```ts
await pool.query(`SELECT * FROM urls WHERE short_code='${code}'`); // dangerous!
```

---

## 9. Zod Validation

Zod lets you describe the *shape* data should have, then check incoming data against it.

```ts
const schema = z.object({
  url: z.string().url()
});
```

Validate:
```ts
schema.parse(req.body); // throws an error if req.body doesn't match
```

Useful methods:
- `.string()` / `.number()` / `.boolean()`
- `.min()` / `.max()` — length or value bounds
- `.url()` — must be a valid URL
- `.email()` — must be a valid email
- `.optional()` — field can be missing
- `.refine()` — custom validation logic

**Why validate at the edge?** Catching bad input in a `schemas/` file, right when the request comes in, means your services and repositories never have to worry about "what if this field is missing?" — they can trust the data is already correct.

---

## 10. Middleware

Middleware is code that runs **before** (or after) your controller — a checkpoint every request passes through.

```ts
app.use(express.json());
```

Custom middleware:
```ts
(req, res, next) => {
  console.log(req.url);
  next(); // pass control to the next middleware/controller
}
```

**Important:** always call `next()` unless you're sending a response — otherwise the request hangs forever with no reply.

---

## 11. Rate Limiting

Protects your API from being spammed or abused.

```ts
rateLimit({
 windowMs: 1000,
 limit: 5
})
```

This means: **one IP address can send at most 5 requests every 1000ms (1 second)**. Requests beyond that get rejected, usually with a `429 Too Many Requests` response.

---

## 12. Environment Variables

Never hardcode secrets (database passwords, API keys) directly in your code.

`.env` file:
```
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
PORT=3000
```

Read them in code:
```ts
process.env.DATABASE_URL
```

**Why:** if secrets are hardcoded, anyone who sees your code (e.g. on GitHub) sees your passwords too. `.env` files should be listed in `.gitignore` so they're never committed.

---

## 13. Docker

| Term | Meaning |
|---|---|
| Image | A blueprint/snapshot of everything your app needs to run |
| Container | A running instance of an image |
| Dockerfile | Instructions to build an image |
| docker-compose.yml | Starts multiple containers together (e.g. your API *and* PostgreSQL) |

For this project, `docker-compose.yml` typically wires together:
```
API
+
PostgreSQL
```

One command to build and run everything:
```bash
docker compose up --build
```

**Why Docker matters:** "it works on my machine" stops being an excuse — the container has the exact same environment everywhere (your laptop, a teammate's laptop, the production server).

---

## 14. Deploying (e.g. Railway)

1. Push project to GitHub
2. Create a Railway project
3. Add a PostgreSQL service
4. Deploy your API service
5. Add the `DATABASE_URL` environment variable
6. Railway builds your Docker image
7. API goes live

---

## 15. Common Errors We Faced

### `req.body` is `undefined`
Forgot:
```ts
app.use(express.json());
```
Without this middleware, Express doesn't know how to parse an incoming JSON body.

### `ECONNREFUSED`
The database wasn't running, or the connection string/port was wrong. Check that PostgreSQL is actually up before your API tries to connect to it.

### `TS1484`
TypeScript wants type-only imports for things that are *only* used as types (not actual runtime values):
```ts
import type { Request, Response } from "express";
```

### Docker `COPY` error
`COPY` needs both a source and a destination:
```dockerfile
COPY . .
```
The first `.` is "everything in the build context," the second `.` is "put it in the container's current working directory."

### Prisma custom client output path (Prisma 7.x)
If you generate the Prisma client to a custom path instead of the default `node_modules/.prisma/client`, make sure every import across the codebase points to that same custom path — mismatched import paths between files is a very common source of "type not found" or "client not generated" errors after upgrading.

---

## 16. Libraries Used

- **express** — Web framework, handles routing and requests/responses
- **pg** — PostgreSQL client for Node.js
- **zod** — Schema validation
- **express-rate-limit** — Rate limiting middleware
- **dotenv** — Loads `.env` files into `process.env`
- **typescript** — Static typing for JavaScript
- **tsx** — Runs TypeScript files directly during development (no manual compile step)

---

## 17. Best Practices

- Controllers should stay small — no business logic, no raw SQL.
- Business logic belongs in services.
- SQL belongs in repositories, nowhere else.
- Validate all input at the boundary (schemas), never trust client data.
- Use environment variables for anything secret or environment-specific.
- Keep helper functions in `utils/` — pure, dependency-free, reusable.
- Handle errors globally with one centralized error-handling middleware rather than scattered `try/catch` blocks with inconsistent responses.
- Keep one function/file doing one job — it makes debugging and testing far easier.

---

## 18. JWT Authentication — Quick Primer

Since this is next on your list (and you've already touched it in Trip.Ilam), here's the short version:

1. User logs in with email/password.
2. Server verifies credentials, then creates a **JWT (JSON Web Token)** — a signed string containing user info (like `userId`) that can't be tampered with without the server's secret key.
3. Server sends the JWT back, often stored in an **HTTP-only cookie** so client-side JavaScript can't read it (safer against XSS attacks).
4. On future requests, the client sends the JWT (usually via cookie or `Authorization` header).
5. A middleware verifies the JWT's signature and attaches the decoded user info to `req.user` before the controller runs.

```ts
// Simplified example
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
```

**Key idea:** the server never *stores* sessions in memory for JWTs — the token itself carries the proof of identity, verified by its signature. This is why JWTs are called "stateless" authentication.

---

## 19. Refresh Tokens

A JWT (§18) is usually short-lived (e.g. 15 minutes) on purpose — if it leaks, the damage window is small. But making a user log in again every 15 minutes is a bad experience. That's what refresh tokens solve.

- **Access token**: short-lived, sent with every request, proves identity.
- **Refresh token**: long-lived (days/weeks), stored securely (HTTP-only cookie or database), used *only* to get a new access token.

Flow:
1. Login → server issues both an access token and a refresh token.
2. Access token expires after 15 min.
3. Client calls `/auth/refresh` with the refresh token.
4. Server verifies it, issues a *new* access token (and often a new refresh token too — this is called **rotation**).
5. If the refresh token is invalid, revoked, or expired, the user must log in again.

```ts
router.post("/auth/refresh", async (req, res) => {
  const oldToken = req.cookies.refreshToken;
  const payload = jwt.verify(oldToken, process.env.REFRESH_SECRET);
  const newAccessToken = jwt.sign({ userId: payload.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.json({ accessToken: newAccessToken });
});
```

**Why bother:** it balances security (short-lived proof of identity) with usability (you don't need to re-enter your password constantly). Storing refresh tokens in the database also lets you revoke a specific user's session — you can't "revoke" a stateless JWT otherwise, since it stays valid until it naturally expires.

---

## 20. Cookies

A cookie is a small piece of data the browser stores and automatically attaches to every request sent to that domain.

```ts
res.cookie("token", jwtString, {
  httpOnly: true,   // JavaScript on the page CANNOT read this cookie — protects against XSS
  secure: true,      // only sent over HTTPS
  sameSite: "strict" // not sent on cross-site requests — protects against CSRF
});
```

| Flag | Protects against | What it does |
|---|---|---|
| `httpOnly` | XSS (malicious injected JS stealing tokens) | Blocks `document.cookie` access from JavaScript |
| `secure` | Network eavesdropping | Cookie only travels over HTTPS |
| `sameSite` | CSRF (a different site tricking the browser into sending your cookie) | Restricts when the cookie is attached to cross-origin requests |

Reading cookies server-side needs the `cookie-parser` middleware:
```ts
app.use(cookieParser());
req.cookies.token
```

**Why cookies over `localStorage` for tokens:** `localStorage` is readable by any JavaScript running on the page — including malicious injected scripts (XSS). An `httpOnly` cookie simply isn't accessible to JS at all, which is a meaningfully stronger default for storing auth tokens.

---

## 21. Redis

Redis is an **in-memory** key-value database — extremely fast because it mostly avoids disk reads, at the cost of being less durable than PostgreSQL by default.

Common backend uses:
- **Caching**: store the result of an expensive DB query so the next request is instant (see §25).
- **Session storage**: store server-side session data keyed by a session ID.
- **Rate limiting**: track request counts per IP with automatic expiry.
- **Refresh token storage**: store valid refresh tokens with a TTL (time-to-live) matching their expiry.

```ts
import { createClient } from "redis";
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

await redis.set("short:abc123", originalUrl, { EX: 3600 }); // expires in 1 hour
const cached = await redis.get("short:abc123");
```

**Why not just use PostgreSQL for everything:** Postgres is built for durability and complex queries; Redis is built for speed on simple key-value lookups. They complement each other — Postgres is your source of truth, Redis is your speed layer.

---

## 22. Prisma

Prisma is an **ORM** (Object-Relational Mapper) — it lets you interact with your database using TypeScript objects and functions instead of writing raw SQL strings.

Compare to raw `pg` (§8):
```ts
// Raw pg
const result = await pool.query("SELECT * FROM urls WHERE short_code=$1", [code]);

// Prisma
const url = await prisma.url.findUnique({ where: { shortCode: code } });
```

Schema definition (`schema.prisma`):
```prisma
model Url {
  id          Int      @id @default(autoincrement())
  originalUrl String
  shortCode   String   @unique
  createdAt   DateTime @default(now())
  expiresOn   DateTime?
}
```

After editing the schema, you generate a type-safe client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Trade-offs:**
- ✅ Type-safe queries (autocomplete for every table/column), less boilerplate, built-in migrations.
- ❌ Another layer of abstraction — very complex queries sometimes still need raw SQL (`prisma.$queryRaw`), and generated-client setup (like the custom output path issue you hit) adds its own configuration surface.

**Repositories still matter with Prisma** — keep Prisma calls inside `repositories/`, not scattered through controllers, for the same reasons as raw SQL.

---

## 23. Testing

Two levels matter most for a backend:

**Unit tests** — test one function/service in isolation, with dependencies faked ("mocked").
```ts
test("generates a 6-character short code", () => {
  const code = generateShortCode();
  expect(code).toHaveLength(6);
});
```

**Integration tests** — test a real route end-to-end, usually against a real (test) database.
```ts
test("POST /shorten returns a short code", async () => {
  const res = await request(app).post("/shorten").send({ url: "https://example.com" });
  expect(res.status).toBe(201);
  expect(res.body.shortCode).toBeDefined();
});
```

Common tools: **Vitest** or **Jest** for the test runner/assertions, **Supertest** for simulating HTTP requests against your Express `app` without actually starting a server.

**Why layered code (§3) makes testing easier:** because services don't know *how* data is stored (that's the repository's job), you can test business logic with a fake repository — no real database needed, and tests run in milliseconds.

---

## 24. Swagger / OpenAPI

OpenAPI is a standard format for describing your API — every endpoint, its inputs, and its possible responses — as a structured document. Swagger UI turns that document into an interactive webpage where anyone can browse and try your API.

```ts
/**
 * @openapi
 * /shorten:
 *   post:
 *     summary: Create a short URL
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url: { type: string }
 *     responses:
 *       201:
 *         description: Short URL created
 */
router.post("/shorten", shortenUrl);
```

**Why:** without documentation, every frontend developer (including future-you) has to read backend source code to figure out what an endpoint expects. Swagger gives a live, testable reference instead — and since your Zod schemas (§9) already describe your data shapes, some tools can generate OpenAPI docs directly from them, keeping validation and documentation in sync.

---

## 25. CI/CD

**CI (Continuous Integration)**: automatically run checks (tests, linting, type-checking) every time code is pushed — catches mistakes before they reach `main`.

**CD (Continuous Deployment)**: automatically deploy code once it passes CI — no manual "build and upload" step.

A simple GitHub Actions workflow (`.github/workflows/ci.yml`):
```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm install
      - run: npm run build
      - run: npm test
```

**Why it matters:** it removes "it passed on my machine" as an excuse, and it means every merge to `main` is verified automatically — which becomes essential once more than one person (or you across many days) is touching the codebase, like with NexaSoft's projects.

---

## 26. WebSockets

HTTP is **request → response**: the client always initiates, the server always replies, then the connection ends. WebSockets keep a connection **open**, letting the server push data to the client at any time — no request required.

Use cases: live chat, real-time notifications, live dashboards, multiplayer features.

```ts
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    console.log("Received:", data.toString());
  });
  socket.send("Welcome!");
});
```

**Why not just poll with regular HTTP requests every few seconds:** polling wastes requests and adds delay (you only find out about new data on the next poll). A WebSocket delivers updates the instant they happen, with far less overhead once the connection is established.

---

## 27. Caching

Caching means storing the result of expensive work (a slow DB query, a heavy computation) so future requests can skip redoing it.

```ts
async function getUrl(code: string) {
  const cached = await redis.get(`url:${code}`);
  if (cached) return JSON.parse(cached);

  const url = await urlRepository.findByCode(code);
  await redis.set(`url:${code}`, JSON.stringify(url), { EX: 3600 });
  return url;
}
```

Key things to think about:
- **TTL (time-to-live)**: how long is cached data allowed to go stale before it's refreshed?
- **Invalidation**: when the underlying data changes (e.g. a URL is deleted), the cache entry needs to be cleared or updated too — this is famously one of the trickiest problems in software ("there are only two hard things in computer science: cache invalidation and naming things").
- **What to cache**: data that's read often but changes rarely is the best candidate. Data that changes every second gains little from caching.

---

## 28. Where This Leaves You

You now have a full path from request to response, plus the surrounding concerns that make an app production-ready:

```
Auth (JWT + refresh tokens + cookies)
        ↓
Route → Controller → Service → Repository → Database (Prisma or pg)
        ↓                                        ↑
   Validation (Zod)                         Cache (Redis)
        ↓
   Response ← documented via Swagger/OpenAPI
        ↓
Tested (unit + integration) → CI/CD → Deployed (Docker + Railway)
        +
WebSockets for anything real-time
```

These notes are a foundation — keep expanding them as you build more backend projects.