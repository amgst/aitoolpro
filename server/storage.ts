import "../env";
import { type Tool, type InsertTool } from "@shared/schema";
import { neon, neonConfig } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

neonConfig.fetchConnectionCache = true;

export interface IStorage {
  getAllTools(): Promise<Tool[]>;
  getToolById(id: string): Promise<Tool | undefined>;
  getToolBySlug(slug: string): Promise<Tool | undefined>;
  getToolByWebsiteUrl(websiteUrl: string): Promise<Tool | undefined>;
  findDuplicateTool(name: string, websiteUrl: string): Promise<Tool | undefined>;
  searchTools(query: string): Promise<Tool[]>;
  getToolsByCategory(category: string): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool>;
  deleteTool(id: string): Promise<boolean>;
}

export class JsonStorage implements IStorage {
  private tools: Map<string, Tool>;
  private dataDir: string;
  private dataFile: string;
  private initialized: boolean = false;
  private readOnly: boolean;
  private readonly readOnlyCandidates: string[];

  constructor() {
    this.tools = new Map();
    const moduleDir = dirname(fileURLToPath(import.meta.url));
    this.readOnlyCandidates = [
      join(moduleDir, "..", "data", "tools.json"),
      join(moduleDir, "data", "tools.json"),
      join(process.cwd(), "data", "tools.json"),
    ];
    this.readOnly =
      process.env.VERCEL === "1" || process.env.READ_ONLY_STORAGE === "1";

    if (this.readOnly) {
      const defaultReadOnlyFile = this.readOnlyCandidates[0];
      this.dataDir = dirname(defaultReadOnlyFile);
      this.dataFile = defaultReadOnlyFile;
    } else {
      this.dataDir = join(process.cwd(), "data");
      this.dataFile = join(this.dataDir, "tools.json");
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    if (this.readOnly) {
      let lastError: Error | null = null;
      for (const candidate of this.readOnlyCandidates) {
        try {
          const data = await fs.readFile(candidate, "utf-8");
          const tools: Tool[] = JSON.parse(data);
          this.dataFile = candidate;
          this.tools = new Map(tools.map((tool) => [tool.id, tool]));
          console.info(
            `[Storage] Initialized read-only data from ${candidate} with ${tools.length} tools`,
          );
          this.initialized = true;
          return;
        } catch (error: any) {
          if (error.code === "ENOENT") {
            lastError = error;
            continue;
          }
          throw new Error(
            `Failed to load read-only storage from ${candidate}: ${error.message}`,
          );
        }
      }

      if (lastError) {
        console.warn(
          `[Storage] tools.json not found in read-only mode. Checked: ${this.readOnlyCandidates.join(
            ", ",
          )}`,
        );
      }
      this.tools = new Map();
      this.initialized = true;
      return;
    }

    try {
      await fs.mkdir(this.dataDir, { recursive: true });

      try {
        const data = await fs.readFile(this.dataFile, "utf-8");
        const tools: Tool[] = JSON.parse(data);
        this.tools = new Map(tools.map((tool) => [tool.id, tool]));
      } catch (error: any) {
        if (error.code === "ENOENT") {
          await this.saveToFile();
        } else {
          throw new Error(`Invalid JSON in ${this.dataFile}: ${error.message}`);
        }
      }

      this.initialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize storage: ${error.message}`);
    }
  }

  private async saveToFile(): Promise<void> {
    if (this.readOnly) {
      throw new Error("Storage is read-only and cannot persist data");
    }

    const tempFile = `${this.dataFile}.tmp`;
    const tools = Array.from(this.tools.values());

    try {
      await fs.writeFile(tempFile, JSON.stringify(tools, null, 2), "utf-8");
      await fs.rename(tempFile, this.dataFile);
    } catch (error: any) {
      try {
        await fs.unlink(tempFile);
      } catch {
        // ignore
      }
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }

  async getAllTools(): Promise<Tool[]> {
    await this.ensureInitialized();
    return Array.from(this.tools.values());
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    return this.tools.get(id);
  }

  async getToolBySlug(slug: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    return Array.from(this.tools.values()).find((tool) => tool.slug === slug);
  }

  async getToolByWebsiteUrl(websiteUrl: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    return Array.from(this.tools.values()).find(
      (tool) => tool.websiteUrl === websiteUrl,
    );
  }

  async findDuplicateTool(name: string, websiteUrl: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    return Array.from(this.tools.values()).find(
      (tool) =>
        tool.name.toLowerCase() === name.toLowerCase() ||
        tool.websiteUrl === websiteUrl,
    );
  }

  async searchTools(query: string): Promise<Tool[]> {
    await this.ensureInitialized();
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.shortDescription.toLowerCase().includes(lowerQuery) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        tool.category.toLowerCase().includes(lowerQuery),
    );
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    await this.ensureInitialized();
    return Array.from(this.tools.values()).filter(
      (tool) => tool.category.toLowerCase() === category.toLowerCase(),
    );
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    await this.ensureInitialized();
    if (this.readOnly) {
      throw new Error("Storage is read-only in this deployment");
    }

    const duplicate = await this.findDuplicateTool(insertTool.name, insertTool.websiteUrl);
    if (duplicate) {
      throw new Error("A tool with this name or website URL already exists");
    }

    const id = randomUUID();
    const tool: Tool = {
      ...insertTool,
      id,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    this.tools.set(id, tool);
    await this.saveToFile();

    return tool;
  }

  async updateTool(id: string, updates: Partial<InsertTool>): Promise<Tool> {
    await this.ensureInitialized();
    if (this.readOnly) {
      throw new Error("Storage is read-only in this deployment");
    }

    const existingTool = this.tools.get(id);
    if (!existingTool) {
      throw new Error("Tool not found");
    }

    const updatedTool: Tool = {
      ...existingTool,
      ...updates,
      id,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    this.tools.set(id, updatedTool);
    await this.saveToFile();

    return updatedTool;
  }

  async deleteTool(id: string): Promise<boolean> {
    await this.ensureInitialized();
    if (this.readOnly) {
      throw new Error("Storage is read-only in this deployment");
    }

    const deleted = this.tools.delete(id);
    if (deleted) {
      await this.saveToFile();
    }

    return deleted;
  }
}

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  category: string;
  pricing: string;
  website_url: string;
  logo_url: string | null;
  features: string[] | null;
  tags: string[] | null;
  badge: string | null;
  rating: number | null;
  source_detail_url: string | null;
  developer: string | null;
  documentation_url: string | null;
  social_links: Record<string, string> | null;
  use_cases: string[] | null;
  screenshots: string[] | null;
  pricing_details: Record<string, string> | null;
  launch_date: string | null;
  last_updated: string;
};

function mapRowToTool(row: ToolRow): Tool {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    pricing: row.pricing,
    websiteUrl: row.website_url,
    logoUrl: row.logo_url ?? undefined,
    features: Array.isArray(row.features) ? row.features : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    badge: row.badge ?? undefined,
    rating: row.rating ?? undefined,
    sourceDetailUrl: row.source_detail_url ?? undefined,
    developer: row.developer ?? undefined,
    documentationUrl: row.documentation_url ?? undefined,
    socialLinks: row.social_links ?? undefined,
    useCases: row.use_cases ?? undefined,
    screenshots: row.screenshots ?? undefined,
    pricingDetails: row.pricing_details ?? undefined,
    launchDate: row.launch_date ?? undefined,
    lastUpdated: row.last_updated,
  };
}

export class PostgresStorage implements IStorage {
  private readonly sql: any;
  private initialized = false;

  constructor(
    private readonly databaseUrl: string = process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      "",
  ) {
    if (!this.databaseUrl) {
      throw new Error(
        "DATABASE_URL (or POSTGRES_URL) must be set to use PostgresStorage",
      );
    }

    this.sql = neon(this.databaseUrl);
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    await this.sql`
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
      await this.sql`ALTER TABLE tools ALTER COLUMN id TYPE TEXT USING id::text;`;
    } catch (_error) {
      // Ignore when the column is already TEXT or table doesn't exist yet
    }

    this.initialized = true;
  }

  private normalizeInsert(input: InsertTool): InsertTool {
    return {
      ...input,
      features: input.features ?? [],
      tags: input.tags ?? [],
      socialLinks: input.socialLinks ?? undefined,
      useCases: input.useCases ?? undefined,
      screenshots: input.screenshots ?? undefined,
      pricingDetails: input.pricingDetails ?? undefined,
    };
  }

  async getAllTools(): Promise<Tool[]> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      ORDER BY name ASC;
    `) as ToolRow[];
    return rows.map(mapRowToTool);
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE id = ${id}
      LIMIT 1;
    `) as ToolRow[];
    return rows.length > 0 ? mapRowToTool(rows[0]) : undefined;
  }

  async getToolBySlug(slug: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE slug = ${slug}
      LIMIT 1;
    `) as ToolRow[];
    return rows.length > 0 ? mapRowToTool(rows[0]) : undefined;
  }

  async getToolByWebsiteUrl(websiteUrl: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE website_url = ${websiteUrl}
      LIMIT 1;
    `) as ToolRow[];
    return rows.length > 0 ? mapRowToTool(rows[0]) : undefined;
  }

  async findDuplicateTool(
    name: string,
    websiteUrl: string,
  ): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE lower(name) = lower(${name})
         OR website_url = ${websiteUrl}
      LIMIT 1;
    `) as ToolRow[];
    return rows.length > 0 ? mapRowToTool(rows[0]) : undefined;
  }

  async searchTools(query: string): Promise<Tool[]> {
    await this.ensureInitialized();
    const pattern = `%${query}%`;
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE name ILIKE ${pattern}
         OR description ILIKE ${pattern}
         OR short_description ILIKE ${pattern}
         OR category ILIKE ${pattern}
         OR EXISTS (
           SELECT 1
           FROM jsonb_array_elements_text(tags) AS tag
           WHERE tag ILIKE ${pattern}
         )
      ORDER BY name ASC;
    `) as ToolRow[];
    return rows.map(mapRowToTool);
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    await this.ensureInitialized();
    const rows = (await this.sql`
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
        source_detail_url,
        developer,
        documentation_url,
        social_links,
        use_cases,
        screenshots,
        pricing_details,
        launch_date,
        last_updated
      FROM tools
      WHERE lower(category) = lower(${category})
      ORDER BY name ASC;
    `) as ToolRow[];
    return rows.map(mapRowToTool);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    await this.ensureInitialized();

    const normalized = this.normalizeInsert(insertTool);
    const duplicate = await this.findDuplicateTool(
      normalized.name,
      normalized.websiteUrl,
    );
    if (duplicate) {
      throw new Error("A tool with this name or website URL already exists");
    }

    const id = randomUUID();
    const lastUpdated =
      normalized.lastUpdated ?? new Date().toISOString().split("T")[0];

    const rows = (await this.sql`
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
        ${id},
        ${normalized.slug},
        ${normalized.name},
        ${normalized.description},
        ${normalized.shortDescription},
        ${normalized.category},
        ${normalized.pricing},
        ${normalized.websiteUrl},
        ${normalized.logoUrl ?? null},
        ${JSON.stringify(normalized.features)}::jsonb,
        ${JSON.stringify(normalized.tags)}::jsonb,
        ${normalized.badge ?? null},
        ${normalized.rating ?? null},
        ${normalized.sourceDetailUrl ?? null},
        ${normalized.developer ?? null},
        ${normalized.documentationUrl ?? null},
        ${normalized.socialLinks ? JSON.stringify(normalized.socialLinks) : null}::jsonb,
        ${normalized.useCases ? JSON.stringify(normalized.useCases) : null}::jsonb,
        ${normalized.screenshots ? JSON.stringify(normalized.screenshots) : null}::jsonb,
        ${normalized.pricingDetails ? JSON.stringify(normalized.pricingDetails) : null}::jsonb,
        ${normalized.launchDate ?? null},
        ${lastUpdated}
      )
      RETURNING
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
        last_updated;
    `) as ToolRow[];

    return mapRowToTool(rows[0]);
  }

  async updateTool(id: string, updates: Partial<InsertTool>): Promise<Tool> {
    await this.ensureInitialized();
    const existing = await this.getToolById(id);
    if (!existing) {
      throw new Error("Tool not found");
    }

    const merged: Tool = {
      ...existing,
      ...updates,
      id,
      lastUpdated: new Date().toISOString().split("T")[0],
      features: updates.features ?? existing.features,
      tags: updates.tags ?? existing.tags,
      socialLinks: updates.socialLinks ?? existing.socialLinks,
      useCases: updates.useCases ?? existing.useCases,
      screenshots: updates.screenshots ?? existing.screenshots,
      pricingDetails: updates.pricingDetails ?? existing.pricingDetails,
    };

    const rows = (await this.sql`
      UPDATE tools
      SET
        slug = ${merged.slug},
        name = ${merged.name},
        description = ${merged.description},
        short_description = ${merged.shortDescription},
        category = ${merged.category},
        pricing = ${merged.pricing},
        website_url = ${merged.websiteUrl},
        logo_url = ${merged.logoUrl ?? null},
        features = ${JSON.stringify(merged.features)}::jsonb,
        tags = ${JSON.stringify(merged.tags)}::jsonb,
        badge = ${merged.badge ?? null},
        rating = ${merged.rating ?? null},
        source_detail_url = ${merged.sourceDetailUrl ?? null},
        developer = ${merged.developer ?? null},
        documentation_url = ${merged.documentationUrl ?? null},
        social_links = ${merged.socialLinks ? JSON.stringify(merged.socialLinks) : null}::jsonb,
        use_cases = ${merged.useCases ? JSON.stringify(merged.useCases) : null}::jsonb,
        screenshots = ${merged.screenshots ? JSON.stringify(merged.screenshots) : null}::jsonb,
        pricing_details = ${merged.pricingDetails ? JSON.stringify(merged.pricingDetails) : null}::jsonb,
        launch_date = ${merged.launchDate ?? null},
        last_updated = ${merged.lastUpdated}
      WHERE id = ${id}
      RETURNING
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
        last_updated;
    `) as ToolRow[];

    return mapRowToTool(rows[0]);
  }

  async deleteTool(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const rows = (await this.sql`
      DELETE FROM tools
      WHERE id = ${id}
      RETURNING id;
    `) as { id: string }[];
    return Array.isArray(rows) && rows.length > 0;
  }
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_UNPOOLED ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

function describeDatabase(urlString: string) {
  try {
    const u = new URL(urlString);
    return {
      host: u.host,
      database: u.pathname.replace(/^\//, ""),
      sslmode: u.searchParams.get("sslmode") || undefined,
    };
  } catch {
    return undefined;
  }
}

const usingPostgres = databaseUrl.length > 0;

let storageModeLogged = false;
const mode = usingPostgres ? "PostgresStorage" : "JsonStorage";
const info = usingPostgres ? describeDatabase(databaseUrl) : undefined;
if (!storageModeLogged) {
  storageModeLogged = true;
  console.info(
    `[Storage] using ${mode}${
      info ? ` (host=${info.host}, db=${info.database}, ssl=${info.sslmode ?? "default"})` : ""
    }`,
  );
}

export const storage: IStorage = usingPostgres
  ? new PostgresStorage(databaseUrl)
  : new JsonStorage();
