// File: server/routes.ts
// Description: Express routes (Neon-only version, no JSON fallback)

import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertToolSchema } from "../shared/schema.js";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

// ✅ Initialize Neon connection once
const databaseUrl = process.env.DATABASE_URL;
// Do not throw at module load on serverless. Defer error to handlers for clearer responses.
const sql: any = databaseUrl ? neon(databaseUrl) : null;

export function setupRoutes(app: Express): void {
  const bases = ["/api", ""]; // support both /api/* and /* when hosted behind a function path

  // Health check
  for (const base of bases)
    app.get(`${base}/health`, async (req, res) => {
      try {
        if (!sql) {
          return res
            .status(500)
            .json({ status: "error", message: "DATABASE_URL is missing" });
        }
        const [{ count }] =
          await sql<{ count: string }[]>`SELECT COUNT(*)::text AS count FROM tools;`;

        res.json({
          status: "ok",
          database: "neon",
          toolsCount: Number(count),
          env: {
            VERCEL: process.env.VERCEL === "1",
            VERCEL_ENV: process.env.VERCEL_ENV,
            VERCEL_URL: process.env.VERCEL_URL,
          },
        });
      } catch (err: any) {
        res.status(500).json({ status: "error", message: err.message });
      }
    });

  // Get distinct categories with counts
  for (const base of bases)
    app.get(`${base}/categories`, async (_req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const rows = await sql`
          SELECT category, COUNT(*)::int AS count
          FROM tools
          GROUP BY category
          ORDER BY category ASC;
        `;
        res.json(rows);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

  // Get all tools (optional search/category filters)
  for (const base of bases)
    app.get(`${base}/tools`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const { search, category, page: pageParam, limit: limitParam } = req.query as {
          search?: string;
          category?: string;
          page?: string;
          limit?: string;
        };

        const page = Math.max(1, Number.isFinite(Number(pageParam)) ? parseInt(pageParam as string, 10) : 1);
        const limitRaw = Number.isFinite(Number(limitParam)) ? parseInt(limitParam as string, 10) : 24;
        const limit = Math.max(1, Math.min(100, limitRaw));
        const offset = (page - 1) * limit;

        const hasSearch = typeof search === "string" && search.trim().length > 0;
        const hasCategory = typeof category === "string" && category.trim().length > 0;

        let tools;
        let totalRows;
        if (!hasSearch && !hasCategory) {
          totalRows = await sql`SELECT COUNT(*)::int AS count FROM tools;`;
          tools = await sql`
            SELECT
              id,
              slug,
              name,
              short_description AS "shortDescription",
              category,
              pricing,
              website_url AS "websiteUrl",
              logo_url AS "logoUrl",
              features,
              badge,
              rating,
              developer
            FROM tools
            ORDER BY name ASC
            LIMIT ${limit} OFFSET ${offset};
          `;
        } else if (hasSearch && !hasCategory) {
          const pattern = "%" + search!.trim() + "%";
          totalRows = await sql`
            SELECT COUNT(*)::int AS count
            FROM tools
            WHERE (name ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR short_description ILIKE ${pattern});
          `;
          tools = await sql`
            SELECT
              id,
              slug,
              name,
              short_description AS "shortDescription",
              category,
              pricing,
              website_url AS "websiteUrl",
              logo_url AS "logoUrl",
              features,
              badge,
              rating,
              developer
            FROM tools
            WHERE (name ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR short_description ILIKE ${pattern})
            ORDER BY name ASC
            LIMIT ${limit} OFFSET ${offset};
          `;
        } else if (!hasSearch && hasCategory) {
          totalRows = await sql`
            SELECT COUNT(*)::int AS count
            FROM tools
            WHERE category = ${category};
          `;
          tools = await sql`
            SELECT
              id,
              slug,
              name,
              short_description AS "shortDescription",
              category,
              pricing,
              website_url AS "websiteUrl",
              logo_url AS "logoUrl",
              features,
              badge,
              rating,
              developer
            FROM tools
            WHERE category = ${category}
            ORDER BY name ASC
            LIMIT ${limit} OFFSET ${offset};
          `;
        } else {
          const pattern = "%" + search!.trim() + "%";
          totalRows = await sql`
            SELECT COUNT(*)::int AS count
            FROM tools
            WHERE (name ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR short_description ILIKE ${pattern})
              AND category = ${category};
          `;
          tools = await sql`
            SELECT
              id,
              slug,
              name,
              short_description AS "shortDescription",
              category,
              pricing,
              website_url AS "websiteUrl",
              logo_url AS "logoUrl",
              features,
              badge,
              rating,
              developer
            FROM tools
            WHERE (name ILIKE ${pattern}
              OR description ILIKE ${pattern}
              OR short_description ILIKE ${pattern})
              AND category = ${category}
            ORDER BY name ASC
            LIMIT ${limit} OFFSET ${offset};
          `;
        }

        const total =
          Array.isArray(totalRows) && totalRows.length > 0 && "count" in totalRows[0]
            ? Number((totalRows as any)[0].count)
            : (tools as any[]).length;
        res.setHeader("X-Total-Count", String(total));
        res.json(tools);
      } catch (err: any) {
        console.error("[/api/tools] error:", err);
        res.status(500).json({ error: err.message });
      }
    });

  // Get a single tool by slug
  for (const base of bases)
    app.get(`${base}/tools/:slug`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const slug = req.params.slug.trim();
        const normalized = slug.toLowerCase();
        const sanitized = normalized.replace(/[^a-z0-9]+/g, "");
        let rows = await sql`
          SELECT
            id,
            slug,
            name,
            description,
            short_description AS "shortDescription",
            category,
            pricing,
            website_url AS "websiteUrl",
            logo_url AS "logoUrl",
            features,
            tags,
            badge,
            rating,
            source_detail_url AS "sourceDetailUrl",
            developer,
            documentation_url AS "documentationUrl",
            social_links AS "socialLinks",
            use_cases AS "useCases",
            screenshots,
            pricing_details AS "pricingDetails",
            launch_date AS "launchDate",
            last_updated AS "lastUpdated"
          FROM tools
          WHERE LOWER(TRIM(slug)) = ${normalized}
             OR slug = ${slug}
             OR LOWER(slug) = ${normalized}
             OR REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g') = ${normalized}
             OR REGEXP_REPLACE(LOWER(slug), '[^a-z0-9]+', '', 'g') = ${sanitized}
             OR REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '', 'g') = ${sanitized}
          LIMIT 1;
        `;

        // Fallback: try computed slug variant if not found yet
        if (rows.length === 0) {
          rows = await sql`
            SELECT
              id,
              slug,
              name,
              description,
              short_description AS "shortDescription",
              category,
              pricing,
              website_url AS "websiteUrl",
              logo_url AS "logoUrl",
              features,
              tags,
              badge,
              rating,
              source_detail_url AS "sourceDetailUrl",
              developer,
              documentation_url AS "documentationUrl",
              social_links AS "socialLinks",
              use_cases AS "useCases",
              screenshots,
              pricing_details AS "pricingDetails",
              launch_date AS "launchDate",
              last_updated AS "lastUpdated"
            FROM tools
            WHERE REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '-', 'g') = ${normalized}
               OR REGEXP_REPLACE(LOWER(name), '[^a-z0-9]+', '', 'g') = ${sanitized}
               OR REGEXP_REPLACE(LOWER(slug), '[^a-z0-9]+', '', 'g') = ${sanitized}
               OR LOWER(TRIM(slug)) = ${normalized}
            LIMIT 1;
          `;
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: "Tool not found" });
        }

        res.json(rows[0]);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

  // Create new tool
  for (const base of bases)
    app.post(`${base}/tools`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const validated = insertToolSchema.parse(req.body);

        const inserted =
          await sql`
          INSERT INTO tools (
            slug, name, description, "shortDescription", category, pricing,
            "websiteUrl", "logoUrl", features, tags, badge, rating, developer,
            "documentationUrl", "lastUpdated"
          ) VALUES (
            ${validated.slug}, ${validated.name}, ${validated.description},
            ${validated.shortDescription}, ${validated.category}, ${validated.pricing},
            ${validated.websiteUrl}, ${validated.logoUrl}, ${JSON.stringify(validated.features)},
            ${JSON.stringify(validated.tags)}, ${validated.badge}, ${validated.rating},
            ${validated.developer}, ${validated.documentationUrl},
            NOW()
          )
          RETURNING *;
        `;

        res.status(201).json(inserted[0]);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Validation error", details: err.errors });
        }
        res.status(500).json({ error: err.message });
      }
    });

  // Update tool by ID
  for (const base of bases)
    app.patch(`${base}/tools/:id`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const partial = insertToolSchema.partial().parse(req.body);
        const id = req.params.id;

        const fields = Object.entries(partial)
          .map(([k, v]) => sql`${sql.identifier([k])} = ${v}`)
          .reduce(
            (acc, curr, idx) =>
              idx === 0 ? curr : sql`${acc}, ${curr}`,
            sql``
          );

        const updated =
          await sql`UPDATE tools SET ${fields} WHERE id = ${id} RETURNING *;`;

        if (updated.length === 0) {
          return res.status(404).json({ error: "Tool not found" });
        }

        res.json(updated[0]);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Validation error", details: err.errors });
        }
        res.status(500).json({ error: err.message });
      }
    });

  // Delete tool by ID
  for (const base of bases)
    app.delete(`${base}/tools/:id`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const id = req.params.id;
        const deleted =
          await sql`DELETE FROM tools WHERE id = ${id} RETURNING *;`;

        if (deleted.length === 0) {
          return res.status(404).json({ error: "Tool not found" });
        }

        res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

  // CSV import
  for (const base of bases)
    app.post(`${base}/tools/import-csv`, async (req, res) => {
      try {
        if (!sql) {
          return res.status(500).json({ error: "DATABASE_URL is missing" });
        }
        const { csvData } = req.body;
        if (!csvData || typeof csvData !== "string") {
          return res.status(400).json({ error: "No CSV data provided" });
        }

        const lines = csvData.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const imported: any[] = [];
        const errors: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(",").map((v) => v.trim());
            const obj: any = {};
            headers.forEach((h, idx) => (obj[h] = values[idx]));
            obj.features = obj.features
              ? obj.features.split("|").map((v: string) => v.trim())
              : [];
            obj.tags = obj.tags
              ? obj.tags.split("|").map((v: string) => v.trim())
              : [];
            obj.rating = obj.rating ? parseFloat(obj.rating) : null;

            const data = insertToolSchema.parse({
              ...obj,
              lastUpdated: new Date().toISOString().split("T")[0],
            });

            await sql`
              INSERT INTO tools (
                slug, name, description, "shortDescription", category, pricing,
                "websiteUrl", "logoUrl", features, tags, badge, rating, developer,
                "documentationUrl", "lastUpdated"
              )
              VALUES (
                ${data.slug}, ${data.name}, ${data.description},
                ${data.shortDescription}, ${data.category}, ${data.pricing},
                ${data.websiteUrl}, ${data.logoUrl}, ${JSON.stringify(data.features)},
                ${JSON.stringify(data.tags)}, ${data.badge}, ${data.rating},
                ${data.developer}, ${data.documentationUrl}, NOW()
              );
            `;

            imported.push(data.slug);
          } catch (err: any) {
            errors.push({ line: i + 1, error: err.message });
          }
        }

        res.json({ success: true, imported: imported.length, errors });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
}

export function createHttpServer(app: Express): Server {
  return createServer(app);
}
