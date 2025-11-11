import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

type ToolRow = Record<string, any>;
type CountRow = { count: number };

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObject<T>(value: unknown): T | undefined {
  if (!value) return undefined;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null ? (parsed as T) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function mapRowToTool(row: ToolRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description ?? row.shortDescription,
    category: row.category,
    pricing: row.pricing,
    websiteUrl: row.website_url ?? row.websiteUrl ?? row.url,
    logoUrl: row.logo_url ?? row.logoUrl ?? undefined,
    features: parseJsonArray(row.features),
    tags: parseJsonArray(row.tags),
    badge: row.badge ?? undefined,
    rating: typeof row.rating === "number" ? row.rating : row.rating ? Number(row.rating) : undefined,
    developer: row.developer ?? undefined,
    documentationUrl: row.documentation_url ?? row.documentationUrl ?? undefined,
    socialLinks: parseJsonObject<Record<string, string>>(row.social_links ?? row.socialLinks),
    useCases: parseJsonArray(row.use_cases ?? row.useCases),
    screenshots: parseJsonArray(row.screenshots),
    pricingDetails: parseJsonObject<Record<string, string>>(row.pricing_details ?? row.pricingDetails),
    launchDate: row.launch_date ?? row.launchDate ?? undefined,
    lastUpdated: row.last_updated ?? row.lastUpdated,
    createdAt: row.created_at ?? row.createdAt,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const { search, category, page: pageParam, limit: limitParam } = req.query as {
        search?: string;
        category?: string;
        page?: string;
        limit?: string;
      };

      const page = Math.max(
        1,
        Number.isFinite(Number(pageParam)) ? parseInt(pageParam!, 10) : 1,
      );
      const limitRaw = Number.isFinite(Number(limitParam))
        ? parseInt(limitParam!, 10)
        : 24;
      const limit = Math.max(1, Math.min(100, limitRaw));
      const offset = (page - 1) * limit;

      const hasSearch = typeof search === "string" && search.trim().length > 0;
      const hasCategory = typeof category === "string" && category.trim().length > 0;

      let tools: ToolRow[] = [];
      let totalRows: CountRow[] = [];

      if (!hasSearch && !hasCategory) {
        totalRows = (await sql`SELECT COUNT(*)::int AS count FROM tools;`) as CountRow[];
        tools = (await sql`
          SELECT
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
            developer,
            documentation_url,
            social_links,
            use_cases,
            screenshots,
            pricing_details,
            launch_date,
            last_updated,
            created_at
          FROM tools
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset};
        `) as ToolRow[];
      } else if (hasSearch && !hasCategory) {
        const pattern = `%${search!.trim()}%`;
        totalRows = (await sql`
          SELECT COUNT(*)::int AS count
          FROM tools
          WHERE name ILIKE ${pattern}
            OR description ILIKE ${pattern}
            OR short_description ILIKE ${pattern};
        `) as CountRow[];
        tools = (await sql`
          SELECT
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
            developer,
            documentation_url,
            social_links,
            use_cases,
            screenshots,
            pricing_details,
            launch_date,
            last_updated,
            created_at
          FROM tools
          WHERE name ILIKE ${pattern}
            OR description ILIKE ${pattern}
            OR short_description ILIKE ${pattern}
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset};
        `) as ToolRow[];
      } else if (!hasSearch && hasCategory) {
        totalRows = (await sql`
          SELECT COUNT(*)::int AS count
          FROM tools
          WHERE category = ${category};
        `) as CountRow[];
        tools = (await sql`
          SELECT
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
            developer,
            documentation_url,
            social_links,
            use_cases,
            screenshots,
            pricing_details,
            launch_date,
            last_updated,
            created_at
          FROM tools
          WHERE category = ${category}
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset};
        `) as ToolRow[];
      } else {
        const pattern = `%${search!.trim()}%`;
        totalRows = (await sql`
          SELECT COUNT(*)::int AS count
          FROM tools
          WHERE (name ILIKE ${pattern}
             OR description ILIKE ${pattern}
             OR short_description ILIKE ${pattern})
            AND category = ${category};
        `) as CountRow[];
        tools = (await sql`
          SELECT
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
            developer,
            documentation_url,
            social_links,
            use_cases,
            screenshots,
            pricing_details,
            launch_date,
            last_updated,
            created_at
          FROM tools
          WHERE (name ILIKE ${pattern}
             OR description ILIKE ${pattern}
             OR short_description ILIKE ${pattern})
            AND category = ${category}
          ORDER BY name ASC
          LIMIT ${limit} OFFSET ${offset};
        `) as ToolRow[];
      }

      const total =
        Array.isArray(totalRows) && totalRows.length > 0
          ? Number(totalRows[0].count)
          : tools.length;

      res.setHeader("Access-Control-Expose-Headers", "X-Total-Count");
      res.setHeader("X-Total-Count", String(total));
      return res.status(200).json(tools.map(mapRowToTool));
    }

    if (req.method === 'POST') {
      const {
        slug,
        name,
        description,
        shortDescription,
        category,
        pricing,
        websiteUrl,
        logoUrl,
        features = [],
        tags = [],
        badge,
        rating,
        developer,
        documentationUrl,
        socialLinks,
        useCases,
        screenshots,
        pricingDetails,
        launchDate,
      } = req.body;

      if (!websiteUrl) {
        return res.status(400).json({ error: "websiteUrl is required" });
      }

      const [tool] = await sql`
        INSERT INTO tools (
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
          ${slug},
          ${name},
          ${description},
          ${shortDescription},
          ${category},
          ${pricing},
          ${websiteUrl},
          ${logoUrl},
          ${JSON.stringify(features)},
          ${JSON.stringify(tags)},
          ${badge},
          ${rating},
          ${developer},
          ${documentationUrl},
          ${socialLinks ? JSON.stringify(socialLinks) : null},
          ${useCases ? JSON.stringify(useCases) : null},
          ${screenshots ? JSON.stringify(screenshots) : null},
          ${pricingDetails ? JSON.stringify(pricingDetails) : null},
          ${launchDate},
          NOW()
        )
        RETURNING *
      `;
      
      return res.status(201).json(mapRowToTool(tool));
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}