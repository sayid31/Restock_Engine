# Smart Supply Chain Restock Engine

A full-stack web application that uses **Fuzzy Logic** to calculate restock urgency for supply chain products. The engine evaluates current stock levels and sales velocity to produce an urgency score and actionable status label.

## How It Works

The core engine implements a **Mamdani-style fuzzy inference system** (equivalent to a Sugeno zero-order model):

1. **Fuzzify** — map `stock` and `salesVelocity` into membership degrees (Low / Medium / High)
2. **Rule evaluation** — fire a 3×3 rule base using MIN conjunction
3. **Defuzzify** — compute a weighted centroid score (0–100)
4. **Label** — convert the score to a human-readable status

| Urgency Score | Status    | Meaning                      |
|---------------|-----------|------------------------------|
| ≥ 75          | Emergency | Restock immediately          |
| 55 – 74       | Urgent    | Schedule restock soon        |
| 30 – 54       | Watch     | Monitor stock levels         |
| < 30          | Safe      | No immediate action needed   |

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Backend   | Node.js · Express · TypeScript · Prisma ORM |
| Frontend  | React · TypeScript · Vite · Tailwind CSS · Recharts |
| Database  | PostgreSQL 16 (Docker)                      |
| Dev Tools | ts-node-dev · concurrently · pgAdmin 4      |

## Project Structure

```
Restock_Engine/
├── src/
│   ├── server.ts               # Express app entry point
│   ├── routes.ts               # API route definitions
│   ├── controllers/
│   │   ├── analysisController.ts   # Analyze & export endpoints
│   │   └── seedController.ts       # Demo data seeder
│   ├── services/
│   │   └── fuzzyService.ts     # Fuzzy logic engine
│   ├── validators/
│   │   └── schemas.ts          # Zod request validation
│   └── lib/
│       └── prisma.ts           # Prisma client singleton
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── components/         # UI components
│       ├── api/                # API client
│       ├── hooks/              # React hooks
│       └── types/              # TypeScript types
├── prisma/
│   └── schema.prisma           # DB schema (Product, RestockAnalysis)
└── docker-compose.yml          # PostgreSQL + pgAdmin
```

## API Endpoints

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/health`               | Health check                       |
| GET    | `/api/v1/products`      | List all products with latest analysis |
| POST   | `/api/v1/analyze`       | Run fuzzy analysis on a product    |
| GET    | `/api/v1/products/export` | Export products to CSV           |
| POST   | `/api/v1/seed`          | Seed database with demo data       |

### Analyze request body

```json
{
  "sku": "PROD-001",
  "name": "Widget A",
  "currentStock": 20,
  "dailySalesAvg": 15
}
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Clone & install

```bash
git clone https://github.com/sayid31/Restock_Engine.git
cd Restock_Engine
npm run setup
```

`npm run setup` installs all dependencies, generates the Prisma client, and pushes the schema to the database.

### 2. Configure environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://postgres:supersecret@localhost:5433/supply_chain_db"
PORT=3000
```

### 3. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on port **5433** and pgAdmin on port **5051** (`http://localhost:5051`).

### 4. Run the app

```bash
npm run dev
```

This starts both the backend (`http://localhost:3000`) and the frontend (`http://localhost:5173`) concurrently.

### 5. Seed demo data (optional)

```bash
curl -X POST http://localhost:3000/api/v1/seed
```

## Development Scripts

| Command              | Description                               |
|----------------------|-------------------------------------------|
| `npm run dev`        | Start backend + frontend simultaneously   |
| `npm run dev:backend`| Start backend only (with hot reload)      |
| `npm run dev:frontend`| Start frontend only (Vite dev server)   |
| `npm run setup`      | Full project setup (install + DB push)    |

## Fuzzy Rule Base

The 3×3 rule matrix maps stock level × sales velocity to urgency:

|            | Slow velocity | Normal velocity | Fast velocity |
|------------|---------------|-----------------|---------------|
| **Low stock**    | Watch         | Urgent          | **Emergency** |
| **Medium stock** | Safe          | Watch           | Urgent        |
| **High stock**   | Safe          | Safe            | Watch         |

## License

MIT
