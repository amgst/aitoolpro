// File: server/routes.ts
// Description: Express routes (Neon-only version, no JSON fallback)

import type { Express } from "express";
import { createServer, type Server } from "http";
import { insertToolSchema } from "@shared/schema";
import { z } from "zod";
import { neon } from "@neondatabase/serverless";

// ✅ Initialize Neon connection once
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in environment variables!");
  throw new Error("DATABASE_URL is required but missing.");
}

const sql = neon(databaseUrl);

export function setupRoutes(app: Express): void {
  const bases = ["/api", ""]; // support both /api/* and /* when hosted behind a function path

  // Health check
  for (const base of bases)
    app.get(`${base}/health`, async (req, res) => {
      try {
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

  // Get all tools (optional search/category filters)
  for (const base of bases)
    app.get(`${base}/tools`, async (req, res) => {
      try {
        const { search, category } = req.query;

        const conditions: any[] = [];
        if (search && typeof search === "string") {
          const pattern = "%" + search + "%";
          conditions.push(
            sql`(name ILIKE ${pattern} OR description ILIKE ${pattern} OR "shortDescription" ILIKE ${pattern})`,
          );
        }
        if (category && typeof category === "string") {
          conditions.push(sql`category = ${category}`);
        }

        const whereClause =
          conditions.length === 0
            ? sql``
            : conditions.reduce(
                (acc, curr, idx) =>
                  idx === 0 ? sql`WHERE ${curr}` : sql`${acc} AND ${curr}`,
                sql``,
              );

        const tools =
          await sql`
            SELECT
              id,
              slug,
              name,
              "shortDescription",
              category,
              pricing,
              "websiteUrl",
              "logoUrl",
              features,
              badge,
              rating,
              developer
            FROM tools
            ${whereClause}
            ORDER BY name ASC;
          `;

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
        const slug = req.params.slug;
        const rows =
          await sql`SELECT * FROM tools WHERE slug = ${slug} LIMIT 1;`;

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
