import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

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
      const tools = await sql`SELECT * FROM tools ORDER BY created_at DESC`;
      return res.status(200).json(tools);
    }

    if (req.method === 'POST') {
      const { name, description, url, category, tags } = req.body;
      
      const [tool] = await sql`
        INSERT INTO tools (name, description, url, category, tags)
        VALUES (${name}, ${description}, ${url}, ${category}, ${tags || []})
        RETURNING *
      `;
      
      return res.status(201).json(tool);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}