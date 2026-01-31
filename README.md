# Live Commentary Server

Real-time sports commentary application backend with Express.js and Neon PostgreSQL.

## Database Setup

This project uses **Drizzle ORM** with **Neon PostgreSQL**.

### Current Schema

**Tables:**
- `matches` - Sports match information
- `commentary` - Real-time commentary events
- `drizzle_migrations` - Migration tracking (auto-created)

**Enums:**
- `match_status` - 'scheduled', 'live', 'finished'

### Available Commands

```bash
# Run migrations
npm run db:migrate

# Start development server
npm run dev

# Start production server
npm start
```

## Migration System

Migrations are managed manually with SQL files:

1. **Create migration file** in `drizzle/` directory:
   ```
   drizzle/0001_add_teams_table.sql
   ```

2. **Write SQL migration**:
   ```sql
   CREATE TABLE "teams" (
     "id" SERIAL PRIMARY KEY,
     "name" TEXT NOT NULL
   );
   ```

3. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

The migration system automatically:
- Tracks applied migrations
- Skips already-applied migrations
- Shows migration history
- Uses transactions for safety

## Project Structure

```
server/
├── drizzle/                 # Migration files (.sql)
├── src/
│   ├── db/
│   │   ├── db.js           # Database client
│   │   └── schema.js       # Drizzle ORM schema
│   ├── migrate.js          # Migration runner
│   └── index.js            # Express server
├── .env                    # Database credentials
└── package.json
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

## Dependencies

**Runtime:**
- express - Web framework
- drizzle-orm - Type-safe ORM
- pg - PostgreSQL driver
- dotenv - Environment variables

**Development:**
- drizzle-kit - Migration tools (optional)
