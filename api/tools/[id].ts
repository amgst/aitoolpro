import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

type ToolRow = Record<string, any>;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const identifier = Array.isArray(id) ? id[0] : id;

  if (!identifier) {
    return res.status(400).json({ error: 'Tool identifier is required' });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const [tool] = await sql`
        SELECT *
        FROM tools
        WHERE id = ${identifier} OR slug = ${identifier}
        LIMIT 1
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json(mapRowToTool(tool));
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const existingToolResult = await sql`
        SELECT id
        FROM tools
        WHERE id = ${identifier} OR slug = ${identifier}
        LIMIT 1
      `;

      const existingTool = existingToolResult[0];

      if (!existingTool) {
        return res.status(404).json({ error: 'Tool not found' });
      }

      const {
        slug,
        name,
        description,
        shortDescription,
        category,
        pricing,
        websiteUrl,
        logoUrl,
        features,
        tags,
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

      const featuresJson =
        features !== undefined ? JSON.stringify(features) : null;
      const tagsJson = tags !== undefined ? JSON.stringify(tags) : null;
      const socialLinksJson =
        socialLinks !== undefined ? JSON.stringify(socialLinks) : null;
      const useCasesJson =
        useCases !== undefined ? JSON.stringify(useCases) : null;
      const screenshotsJson =
        screenshots !== undefined ? JSON.stringify(screenshots) : null;
      const pricingDetailsJson =
        pricingDetails !== undefined ? JSON.stringify(pricingDetails) : null;

      const [tool] = await sql`
        UPDATE tools
        SET slug = COALESCE(${slug}, slug),
            name = COALESCE(${name}, name), 
            description = COALESCE(${description}, description), 
            short_description = COALESCE(${shortDescription}, short_description),
            category = COALESCE(${category}, category), 
            pricing = COALESCE(${pricing}, pricing),
            website_url = COALESCE(${websiteUrl}, website_url),
            logo_url = COALESCE(${logoUrl}, logo_url),
            features = COALESCE(${featuresJson}::jsonb, features),
            tags = COALESCE(${tagsJson}::jsonb, tags),
            badge = COALESCE(${badge}, badge),
            rating = COALESCE(${rating}, rating),
            developer = COALESCE(${developer}, developer),
            documentation_url = COALESCE(${documentationUrl}, documentation_url),
            social_links = COALESCE(${socialLinksJson}::jsonb, social_links),
            use_cases = COALESCE(${useCasesJson}::jsonb, use_cases),
            screenshots = COALESCE(${screenshotsJson}::jsonb, screenshots),
            pricing_details = COALESCE(${pricingDetailsJson}::jsonb, pricing_details),
            launch_date = COALESCE(${launchDate}, launch_date),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingTool.id}
        RETURNING *
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json(mapRowToTool(tool));
    }

    if (req.method === 'DELETE') {
      const existingToolResult = await sql`
        SELECT id
        FROM tools
        WHERE id = ${identifier} OR slug = ${identifier}
        LIMIT 1
      `;

      const existingTool = existingToolResult[0];

      if (!existingTool) {
        return res.status(404).json({ error: 'Tool not found' });
      }

      const [tool] = await sql`
        DELETE FROM tools WHERE id = ${existingTool.id}
        RETURNING *
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json({ message: 'Tool deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}