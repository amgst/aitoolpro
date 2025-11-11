import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const { id } = req.query;

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      const [tool] = await sql`SELECT * FROM tools WHERE id = ${id as string}`;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json(tool);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, description, url, category, tags } = req.body;
      
      const [tool] = await sql`
        UPDATE tools
        SET name = ${name}, description = ${description}, url = ${url}, 
            category = ${category}, tags = ${tags || []}
        WHERE id = ${id as string}
        RETURNING *
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json(tool);
    }

    if (req.method === 'DELETE') {
      const [tool] = await sql`
        DELETE FROM tools WHERE id = ${id as string}
        RETURNING *
      `;
      
      if (!tool) {
        return res.status(404).json({ error: 'Tool not found' });
      }
      
      return res.status(200).json({ message: 'Tool deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}