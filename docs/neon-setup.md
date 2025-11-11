# Neon Database Setup

Follow these steps to run the API against a Neon Postgres database instead of the bundled JSON snapshot.

## 1. Provision Neon

1. Sign in at <https://console.neon.tech>.
2. Create a new project (the free tier is enough for testing).
3. Pick a region close to your users and leave the default branch/database (e.g. `main` / `neondb`).

## 2. Grab the Connection URL

1. Open the **Connect** tab for the project.
2. Copy the **psql** connection string (works with the `@neondatabase/serverless` driver) or the **Prisma** variant if you prefer.
3. Append `?sslmode=require` if Neon did not include it automatically.

## 3. Configure the App Locally

1. Create `docs/env.example` → `.env` at the project root.
2. Set `DATABASE_URL` to the Neon connection string you copied.
3. Install dependencies and seed the database:
   ```bash
   npm install
   npm run db:seed
   ```
   The seed script creates the `tools` table (if needed) and upserts everything from `data/tools.json`.

## 4. Configure Vercel

1. In the Vercel project, go to **Settings → Environment Variables**.
2. Add `DATABASE_URL` with the same Neon URL for each environment (`Production`, `Preview`, optionally `Development`).
3. Trigger a deployment (`vercel --prod`), or re-deploy from the dashboard.

## 5. Verify

After deployment:

- Hit `/api/health` – the handler should respond with `{ "status": "ok", ... }`.
- Use the admin UI to add/edit tools – writes will persist in Neon.

## 6. Optional Tweaks

- **Connection pooling:** Neon issues a pooled connection string (marked “Vercel”). You can use that in place of the default URL for better cold-start behaviour.
- **Read-only fallbacks:** Remove the `DATABASE_URL` variable to fall back to the bundled JSON file (read-only mode). Set `READ_ONLY_STORAGE=1` locally if you want to mimic that behaviour without touching Vercel.
- **Schema migrations:** The project ships with Drizzle configuration. After editing `shared/schema.ts`, run:
  ```bash
  npx drizzle-kit generate
  npx drizzle-kit push
  ```
  (Both commands require `DATABASE_URL` to be set.)


