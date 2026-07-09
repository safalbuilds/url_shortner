# URL Shortener

A minimal, fast URL shortener API built with Express, TypeScript, and PostgreSQL.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/short` | Create a random short URL |
| `POST` | `/api/customShort` | Create a custom short URL |
| `GET` | `/api/:shortCode` | Redirect to the original URL |
| `GET` | `/api/stats/:shortCode` | Get statistics for a short URL |
| `GET` | `/api/docs` | View the API documentation (README) |
| `GET` | `/admin/fetchAll` | List all short URLs *(dev only)* |
| `DELETE` | `/admin/delete/:shortcode` | Delete a short URL *(dev only)* |

## Features

- Shorten any long URL into a random 6-character short code
- Create custom short codes for branded links
- Automatic redirect from short code to original URL
- Click tracking per short URL
- Link expiry support (expired links return `410 Gone`)
- Rate limiting (3 requests/second) on link creation endpoints
- Dockerized for easy local development and deployment
- Admin routes for listing and deleting URLs, disabled outside development

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL (via `pg`)
- **Validation:** Zod
- **Rate limiting:** `express-rate-limit`

## Project Structure

```
src/
├── app.ts                          # Express app setup & middleware
├── index.ts                        # Entry point
├── config/
│   └── env.ts                      # Environment config (PORT)
├── lib/
│   └── db.ts                       # PostgreSQL connection pool
├── errors/
│   └── AppError.ts                 # Custom application error class
├── middleware/
│   ├── errorHandlers.ts            # Global error handler
│   └── rateLimit.ts                # Rate limiter for URL creation
├── routes/
│   ├── url.routes.ts               # Route definitions for urls
│   ├── docs.routes.ts              # Route definitions for docs
│   └── admin.routes.ts             # Dev-only admin routes (list/delete)
├── controllers/
│   ├── url.controller.ts           # Request handlers
│   ├── docs.controller.ts          # Serves this README as raw markdown
│   └── url.admin.controller.ts     # Admin request handlers (fetchAll/delete)
├── services/
│   └── url.service.ts              # Business logic
├── repositories/
│   └── url.respository.ts          # Database queries
├── schemas/
│   └── url.schema.ts               # Zod request validation
└── utils/
    ├── apiResponse.ts              # Standardized API response shapes
    └── shortCode.ts                # Random short code generator
```

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL (or use the provided Docker Compose setup)

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/url_shortner
```

`NODE_ENV` controls whether the admin routes (`/admin/fetchAll`, `/admin/delete/:shortcode`)
are registered. Leave it unset locally so they're available while developing; your hosting
provider should set `NODE_ENV=production` at deploy time so they're excluded automatically.
Don't set `NODE_ENV` in your `.env` file for local dev — let it stay unset or use whatever
your tooling sets by default.

### Database Setup

The app expects a `urls` table with the following shape:

```sql
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) UNIQUE NOT NULL,
    click_count INTEGER DEFAULT 0,
    expires_on TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Install & Run Locally

```bash
npm install
npm run dev       # starts in watch mode with tsx
```

### Run with Docker Compose

Spins up both the API and a PostgreSQL instance:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## API Reference

Base path: `/api`

### Create a Short URL

```
POST /api/short
Content-Type: application/json

{
  "url": "https://example.com/some/very/long/path"
}
```

**Response** `201 Created`
```json
{
  "success": true,
  "message": "Short Url created Successfully",
  "shortUrl": "http://localhost:3000/api/aB3xY9",
  "data": {
    "id": 1,
    "original_url": "https://example.com/some/very/long/path",
    "short_code": "aB3xY9",
    "click_count": 0,
    "expires_on": null,
    "created_at": "..."
  }
}
```

### Create a Custom Short URL

```
POST /api/customShort
Content-Type: application/json

{
  "url": "https://example.com/some/very/long/path",
  "shortCode": "my-link"
}
```

Returns `409 Conflict` if the short code is already taken.

### Redirect to Original URL

```
GET /api/:shortCode
```

Redirects to the original URL and increments the click count.

- `404 Not Found` if the short code doesn't exist
- `410 Gone` if the link has expired

### Get Short URL Stats

```
GET /api/stats/:shortCode
```

Returns the raw database record for the given short code, including `click_count`.

### Get API Documentation

```
GET /api/docs
```

Returns this `README.md` file as raw markdown (`Content-Type: text/markdown`). Useful for fetching docs programmatically without leaving your terminal or tooling.

## Admin Routes (development only)

Base path: `/admin`

These routes are only registered when `NODE_ENV !== "production"`. They are not
protected by authentication, so they should never be reachable on a publicly
deployed instance — treat `NODE_ENV=production` as the only thing standing
between these and the public internet, and don't rely on it as a substitute
for real access control if you plan to keep them around long-term.

```
GET /admin/fetchAll
```
Returns every short URL row in the database.

```
DELETE /admin/delete/:shortcode
```
Permanently deletes the short URL matching `:shortcode`.

## Rate Limiting

`POST /api/short` and `POST /api/customShort` are limited to **3 requests per second per client** to prevent abuse.

## License

ISC