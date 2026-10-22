# Lovable Clone

An AI coding-agent backend inspired by Lovable. Users create projects and send prompts; a [Temporal](https://temporal.io) worker runs the agent workflow and stores results in Postgres.

## Tech Stack

- **Runtime:** Node.js, TypeScript, Express 5
- **Database:** PostgreSQL 16 via Prisma 7 (`@prisma/adapter-pg`)
- **Orchestration:** Temporal (client, worker, workflows, activities)
- **LLM:** OpenAI via LangChain (`@langchain/openai`)
- **Validation:** Zod
- **Logging:** Winston, with Morgan for HTTP request logs

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
        ├── agents/       # Agent prompts, runners, shared rules and types (planner, designer)
        ├── controllers/  # Request handlers
        ├── lib/          # LLM/model helpers, prompts, sandbox, todo/plan utilities
        ├── routes/       # API routes
        ├── schemas/      # Zod validators
        ├── services/     # Business logic
        ├── repositories/ # Data access
        └── temporal/     # Client, worker, workflows, activities
```

## How It Works

Creating a project starts `codeAgentWorkflow` on Temporal. The worker:

1. Creates a sandbox under `data/sandbox/<projectId>`.
2. Loads the project's previous messages as the conversation thread.
3. Runs the planner agent, which turns the prompt into a todo list.
4. Generates a title and a response, then saves the result (message, title, files, sandbox URL).

> The coding agent is not implemented yet: the saved files and summary are placeholders.

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
OPENAI_API_KEY=sk-...
ENV

# Generate the Prisma client and apply migrations
npm run db:generate
npm run db:migrate

# Start the API server (with watch mode)
npm run dev

# Or start the API server and the Temporal worker together
npm run dev:all
```

The worker must be running for prompts to be processed.

The API listens on `http://localhost:3000` by default. The Temporal UI is at `http://localhost:8233`.

## Environment Variables

| Variable                | Default           | Description                  |
| ----------------------- | ----------------- | ---------------------------- |
| `DATABASE_URL`          | — (required)      | Postgres connection string   |
| `API_PORT`              | `3000`            | API server port              |
| `NODE_ENV`              | `development`     | Environment                  |
| `LOG_LEVEL`             | `http` (`info` in production) | Winston log level |
| `LOG_DIR`               | `logs`            | Log file directory (production only) |
| `TEMPORAL_ADDRESS`      | `localhost:7233`  | Temporal server address      |
| `TEMPORAL_TASK_QUEUE`   | `coding-agent`    | Temporal task queue          |
| `TEMPORAL_NAMESPACE`    | `default`         | Temporal namespace           |
| `OPENAI_API_KEY`        | — (required for LLM calls) | OpenAI API key |
| `OPENAI_MODEL`          | `gpt-4o-mini`     | Model for titles and responses |
| `OPENAI_PLANNING_MODEL` | `gpt-5-mini`      | Model for the planner agent  |
| `OPENAI_BUILDER_MODEL`  | `gpt-5-mini`      | Model for the builder agent  |
| `OPENAI_REASONING_MODEL`| `gpt-5-mini`      | Model for reasoning tasks    |
| `OPENAI_REASONING_EFFORT` | `medium`        | `low`, `medium` or `high`    |

See `server/.env.example` for a full template.

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
| `npm run dev`         | Run the API server in watch mode |
| `npm run dev:all`     | Run the API server and Temporal worker |
| `npm run docker:up`   | Start infrastructure containers  |
| `npm run docker:down` | Stop containers                  |
| `npm run docker:logs` | Tail container logs              |
| `npm run db:migrate`  | Run Prisma migrations            |
| `npm run db:studio`   | Open Prisma Studio               |
| `npm run db:generate` | Generate the Prisma client       |
| `npm run db:push`     | Push schema to the database      |
