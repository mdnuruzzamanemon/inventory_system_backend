# Inventory Backend

Real-time inventory management API for limited edition sneaker drops. Handles atomic reservations, stock recovery, and live broadcasting via WebSockets.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Real-time:** Socket.io
- **Auth:** JWT (bcryptjs)
- **Validation:** Zod
- **Dev server:** ts-node-dev

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

## Setup

Clone the repo and install dependencies:

```bash
cd backend
npm install
```

Copy the environment file and adjust values to match your local setup:

```bash
cp .env.example .env
```

## Database

### Create the database

```bash
createdb inventory_db
```

Or via psql:

```sql
CREATE DATABASE inventory_db;
```

### Schema & migrations

The project uses Sequelize's `sync({ alter: true })` during development. On startup (`npm run dev`), the server automatically creates/updates tables to match the current models. No manual migration steps needed for local development.

If you'd rather use proper migration files for staging/production, you can generate them with Sequelize CLI:

```bash
npx sequelize-cli migration:generate --name init
```

But honestly, for dev work the auto-sync approach saves time. Just make sure your `.env` points to the right database.

### Connection config

These are the env vars you need to set in `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## Running

```bash
npm run dev
```

Starts the server on `http://localhost:4000` with hot-reload via ts-node-dev.

For production:

```bash
npm run build
npm start
```

## What's inside

### Project structure

```
src/
├── config/             # DB connection, env vars, model associations
├── middleware/          # Auth (JWT), validation (Zod), error handler
├── modules/
│   ├── auth/           # Register, login
│   ├── users/          # User model & profile endpoint
│   ├── drops/          # Create merch drops, list active/upcoming
│   ├── products/       # Product model (used by drops)
│   ├── reservations/   # Reserve items with row-level locking
│   └── purchases/      # Complete purchase flow
├── shared/             # AppError, logger, async handler, types
├── socket/             # Socket.io initialization & event helpers
├── app.ts              # Express app setup
└── server.ts           # Entry point (binds DB, HTTP, Socket.io)
```

### Key endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/drops` | No | Create a new merch drop |
| GET | `/api/drops/active` | No | Active drops with stock & recent buyers |
| GET | `/api/drops/upcoming` | No | Upcoming drops with countdown |
| POST | `/api/reservations` | Yes | Reserve a product (atomic) |
| GET | `/api/reservations/me` | Yes | My active reservations |
| POST | `/api/purchases` | Yes | Complete a purchase |

### How reservation locking works

When a user reserves, the backend runs a **database transaction** with `SELECT ... FOR UPDATE` on the product row. This locks that row until the transaction commits, preventing any other concurrent request from reading stale stock. If two users hit reserve at the exact same millisecond for the last item, only the first transaction gets the lock — the second one sees `availableStock = 0` and fails cleanly.

Reservations auto-expire after 60 seconds (configurable via `RESERVATION_TTL_SECONDS`). A `setTimeout` fires on the server, marks the reservation as expired, restores the stock, and broadcasts the update to all connected clients.

### Real-time events (Socket.io)

| Event | Direction | Payload |
|-------|-----------|---------|
| `stock:update` | Server → Client | `{ productId, availableStock }` |
| `reservation:expired` | Server → Client | `{ reservationId, productId }` |
| `purchase:new` | Server → Client | `{ productId, username, purchasedAt }` |




