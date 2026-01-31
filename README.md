# Live Commentary Server

Real-time sports commentary backend built with Express.js, WebSockets, and Neon PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express.js 5
- **WebSockets:** ws
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon)
- **Validation:** Zod

## Project Structure

```text
sportz-websockets/
├── drizzle/                    # SQL migration files
├── src/
│   ├── db/
│   │   ├── db.js               # Database client (pg + Drizzle)
│   │   └── schema.js           # Table & relation definitions
│   ├── routes/
│   │   └── match.js            # Match CRUD endpoints
│   ├── validation/
│   │   └── matches.js          # Zod schemas for request validation
│   ├── utils/
│   │   └── matchStatus.js      # Match status derivation logic
│   ├── ws/
│   │   └── server.js           # WebSocket server setup
│   └── index.js                # App entrypoint
├── .env                        # Environment variables
├── drizzle.config.js           # Drizzle Kit config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or local)

### Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run database migrations
npm run db:migrate

# Start development server (with hot reload)
npm run dev
```

## Environment Variables

| Variable       | Description                  | Default     |
|----------------|------------------------------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | (required)  |
| `PORT`         | HTTP server port             | `8000`      |
| `HOST`         | Server bind address          | `0.0.0.0`   |

## API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | `/api/`       | Welcome / health    |
| GET    | `/api/match`  | List matches        |
| POST   | `/api/match`  | Create a new match  |

### GET /api/match

Query parameters:

| Param   | Type   | Description              | Default |
|---------|--------|--------------------------|---------|
| `limit` | number | Max results (1-100)      | `10`    |

### POST /api/match

Request body:

```json
{
  "sport": "cricket",
  "homeTeam": "India",
  "awayTeam": "Australia",
  "startTime": "2026-02-01T10:00:00Z",
  "endTime": "2026-02-01T18:00:00Z",
  "homeScore": 0,
  "awayScore": 0
}
```

| Field       | Type   | Required | Notes                          |
|-------------|--------|----------|--------------------------------|
| `sport`     | string | yes      | Non-empty                      |
| `homeTeam`  | string | yes      | Non-empty                      |
| `awayTeam`  | string | yes      | Non-empty                      |
| `startTime` | string | yes      | Valid ISO 8601 date            |
| `endTime`   | string | yes      | Must be after `startTime`      |
| `homeScore` | number | no       | Non-negative integer, default 0|
| `awayScore` | number | no       | Non-negative integer, default 0|

## WebSocket

Connect to `ws://localhost:8000/ws`.

### Messages from server

**On connect:**
```json
{ "type": "welcome", "message": "Welcome to the WebSocket server!" }
```

**On match created:**
```json
{ "type": "matchCreated", "match": { "id": 1, "sport": "cricket", ... } }
```

## Database Schema

### matches

| Column      | Type           | Notes                              |
|-------------|----------------|------------------------------------|
| `id`        | serial (PK)    | Auto-increment                     |
| `sport`     | text           | Not null                           |
| `home_team` | text           | Not null                           |
| `away_team` | text           | Not null                           |
| `status`    | match_status   | `scheduled`, `live`, `finished`    |
| `start_time`| timestamp      | Not null                           |
| `end_time`  | timestamp      |                                    |
| `home_score`| integer        | Default 0                          |
| `away_score`| integer        | Default 0                          |
| `created_at`| timestamp      | Auto-set                           |

### commentary

| Column      | Type           | Notes                              |
|-------------|----------------|------------------------------------|
| `id`        | serial (PK)    | Auto-increment                     |
| `match_id`  | integer (FK)   | References matches, cascade delete |
| `minute`    | integer        |                                    |
| `sequence`  | integer        | Not null                           |
| `period`    | text           |                                    |
| `event_type`| text           | Not null                           |
| `actor`     | text           |                                    |
| `team`      | text           |                                    |
| `message`   | text           | Not null                           |
| `metadata`  | jsonb          |                                    |
| `tags`      | text[]         |                                    |
| `created_at`| timestamp      | Auto-set                           |

## NPM Scripts

| Script          | Command                      | Description                  |
|-----------------|------------------------------|------------------------------|
| `npm start`     | `node src/index.js`          | Start production server      |
| `npm run dev`   | `node --watch src/index.js`  | Start with hot reload        |
| `npm run db:generate` | `drizzle-kit generate`  | Generate migration files     |
| `npm run db:migrate`  | `drizzle-kit migrate`   | Run pending migrations       |
| `npm run db:studio`   | `drizzle-kit studio`    | Open Drizzle Studio UI       |
