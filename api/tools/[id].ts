import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

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
      
      return res.status(200).json(tool);
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

      const { name, description, url, category, tags, slug } = req.body;
      
      const [tool] = await sql`
        UPDATE tools
        SET name = ${name}, 
            description = ${description}, 
            url = ${url}, 
            category = ${category}, 
            tags = ${tags || []},
            slug = COALESCE(${slug}, slug),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingTool.id}
        RETURNING *
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json(tool);
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