import "../env";
import "dotenv/config";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { neon, neonConfig } from "@neondatabase/serverless";
import type { Tool } from "@shared/schema";

neonConfig.fetchConnectionCache = true;

async function ensureTable(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT NOT NULL,
      category TEXT NOT NULL,
      pricing TEXT NOT NULL,
      website_url TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      badge TEXT,
      rating DOUBLE PRECISION,
      source_detail_url TEXT,
      developer TEXT,
      documentation_url TEXT,
      social_links JSONB,
      use_cases JSONB,
      screenshots JSONB,
      pricing_details JSONB,
      launch_date TEXT,
      last_updated TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  try {
    await sql`ALTER TABLE tools ALTER COLUMN id TYPE TEXT USING id::text;`;
  } catch {
    // ignore if already text
  }
}

function resolveDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_UNPOOLED,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter(Boolean) as string[];

  if (candidates.length === 0) {
    throw new Error("DATABASE_URL (or equivalent Postgres env var) is required");
  }

  return candidates[0]!;
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();
  const sql = neon(databaseUrl);

  await ensureTable(sql);

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const toolsPath = join(__dirname, "..", "data", "tools.json");
  const raw = await readFile(toolsPath, "utf-8");
  const tools: Tool[] = JSON.parse(raw);

  console.log(`Seeding ${tools.length} tools into Neon...`);

  for (const tool of tools) {
    await sql`
      INSERT INTO tools (
        id,
        slug,
        name,
        description,
        short_description,
        category,
        pricing,
        website_url,
        logo_url,
        features,
        tags,
        badge,
        rating,
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      )
      VALUES (
        ${tool.id},
        ${tool.slug},
        ${tool.name},
        ${tool.description},
        ${tool.shortDescription},
        ${tool.category},
        ${tool.pricing},
        ${tool.websiteUrl},
        ${tool.logoUrl ?? null},
        ${JSON.stringify(tool.features ?? [])}::jsonb,
        ${JSON.stringify(tool.tags ?? [])}::jsonb,
        ${tool.badge ?? null},
        ${tool.rating ?? null},
        ${tool.sourceDetailUrl ?? null},
        ${tool.developer ?? null},
        ${tool.documentationUrl ?? null},
        ${tool.socialLinks ? JSON.stringify(tool.socialLinks) : null}::jsonb,
        ${tool.useCases ? JSON.stringify(tool.useCases) : null}::jsonb,
        ${tool.screenshots ? JSON.stringify(tool.screenshots) : null}::jsonb,
        ${tool.pricingDetails ? JSON.stringify(tool.pricingDetails) : null}::jsonb,
        ${tool.launchDate ?? null},
        ${tool.lastUpdated}
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        category = EXCLUDED.category,
        pricing = EXCLUDED.pricing,
        website_url = EXCLUDED.website_url,
        logo_url = EXCLUDED.logo_url,
        features = EXCLUDED.features,
        tags = EXCLUDED.tags,
        badge = EXCLUDED.badge,
        rating = EXCLUDED.rating,
        source_detail_url = EXCLUDED.source_detail_url,
        developer = EXCLUDED.developer,
        documentation_url = EXCLUDED.documentation_url,
        social_links = EXCLUDED.social_links,
        use_cases = EXCLUDED.use_cases,
        screenshots = EXCLUDED.screenshots,
        pricing_details = EXCLUDED.pricing_details,
        launch_date = EXCLUDED.launch_date,
        last_updated = EXCLUDED.last_updated;
    `;
  }

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text AS count FROM tools;
  `;

  console.log(`Seed complete. tools table now has ${count} rows.`);
}

main().catch((error) => {
  console.error("Failed to seed Neon database:", error);
  process.exit(1);
});

