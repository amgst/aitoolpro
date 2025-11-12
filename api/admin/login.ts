import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  isPasswordRequired,
  isPasswordValid,
  serializeAdminSessionCookie,
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

  const password = (req.body?.password ?? "") as string;
  const passwordRequired = isPasswordRequired();

  if (passwordRequired) {
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!isPasswordValid(password)) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }

  const token = createSessionToken();
  const secure = process.env.NODE_ENV === "production";
  res.setHeader("Set-Cookie", serializeAdminSessionCookie(token, secure));

  return res.status(200).json({
    authenticated: true,
    expiresIn: ADMIN_SESSION_TTL_MS,
    passwordRequired,
  });
}

