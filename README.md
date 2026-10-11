# Lovable Clone

An AI coding-agent backend inspired by Lovable. Users create projects and send prompts; a [Temporal](https://temporal.io) worker runs the agent workflow and stores results in Postgres.

## Tech Stack

- **Runtime:** Node.js, TypeScript, Express 5
- **Database:** PostgreSQL 16 via Prisma 7 (`@prisma/adapter-pg`)
- **Orchestration:** Temporal (client, worker, workflows, activities)
- **Validation:** Zod

## Project Structure

```
.
├── docker/postgres/      # Postgres init script (creates Temporal databases)
├── docker-compose.yml    # Postgres, Temporal, Temporal UI
├── data/sandbox/         # Agent sandbox workspace
└── server/
    ├── prisma/           # Schema and migrations
    └── src/
        ├── config/       # Env and constants
        ├── controllers/  # Request handlers
        ├── routes/       # API routes
        ├── schemas/      # Zod validators
        ├── services/     # Business logic
        ├── repositories/ # Data access
        └── temporal/     # Client, worker, workflows, activities
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker

### Setup

```bash
npm install

# Start Postgres, Temporal and Temporal UI
npm run docker:up

# Configure environment
cat > server/.env <<'ENV'
DATABASE_URL=postgresql://vibe:vibe@localhost:5433/lovable
ENV

# Generate the Prisma client and apply migrations
npm run db:generate
npm run db:migrate

# Start the API server (with watch mode)
npm run dev
```

The API listens on `http://localhost:3000` by default. The Temporal UI is at `http://localhost:8233`.

## Environment Variables

| Variable                | Default           | Description                  |
| ----------------------- | ----------------- | ---------------------------- |
| `DATABASE_URL`          | — (required)      | Postgres connection string   |
| `API_PORT`              | `3000`            | API server port              |
| `NODE_ENV`              | `development`     | Environment                  |
| `TEMPORAL_ADDRESS`      | `localhost:7233`  | Temporal server address      |
| `TEMPORAL_TASK_QUEUE`   | `coding-agent`    | Temporal task queue          |
| `TEMPORAL_NAMESPACE`    | `default`         | Temporal namespace           |

## API

Base path: `/api`.

| Method | Path                         | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/health`                    | Health check             |
| GET    | `/projects`                  | List projects            |
| POST   | `/projects`                  | Create a project         |
| GET    | `/projects/:id`              | Get a project            |
| GET    | `/projects/:id/messages`     | List a project's messages|

## Scripts

| Script                | Description                      |
| --------------------- | -------------------------------- |
| `npm run dev`         | Run the server in watch mode     |
| `npm run docker:up`   | Start infrastructure containers  |
| `npm run docker:down` | Stop containers                  |
| `npm run docker:logs` | Tail container logs              |
| `npm run db:migrate`  | Run Prisma migrations            |
| `npm run db:studio`   | Open Prisma Studio               |
| `npm run db:generate` | Generate the Prisma client       |
| `npm run db:push`     | Push schema to the database      |
