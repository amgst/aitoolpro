import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  ADMIN_COOKIE_NAME,
  parseCookies,
  verifySessionToken,
} from "../../shared/adminAuth.js";

function applyCors(res: VercelResponse, req: VercelRequest) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  applyCors(res, req);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cookies = parseCookies(req.headers.cookie as string | undefined);
  const token = cookies[ADMIN_COOKIE_NAME];

  if (verifySessionToken(token)) {
    return res.status(200).json({ authenticated: true });
  }

  return res.status(401).json({ authenticated: false });
}

