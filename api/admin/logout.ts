import type { VercelRequest, VercelResponse } from "@vercel/node";
import { serializeClearAdminSessionCookie } from "../../shared/adminAuth.js";

function applyCors(res: VercelResponse, req: VercelRequest) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  applyCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader(
    "Set-Cookie",
    serializeClearAdminSessionCookie(process.env.NODE_ENV === "production"),
  );
  return res.status(200).json({ success: true });
}

