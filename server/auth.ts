import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const activeSessions = new Set<string>();

function hashToken(token: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, cookie) => {
    const [name, ...rest] = cookie.split("=");
    if (!name) return acc;
    acc[name.trim()] = decodeURIComponent(rest.join("=").trim());
    return acc;
  }, {} as Record<string, string>);
}

function getSessionToken(req: Request): string | undefined {
  const cookies = parseCookies(req);
  return cookies[COOKIE_NAME];
}

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_PASSWORD);
}

export function isAdminAuthenticated(req: Request): boolean {
  const token = getSessionToken(req);
  if (!token) return false;
  return activeSessions.has(hashToken(token));
}

export function setAdminSession(res: Response): void {
  const token = crypto.randomBytes(32).toString("hex");
  activeSessions.add(hashToken(token));

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

export function clearAdminSession(req: Request, res: Response): void {
  const token = getSessionToken(req);
  if (token) {
    activeSessions.delete(hashToken(token));
  }
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAdminApi(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!isAdminConfigured()) {
    res.status(500).json({ error: "Admin password is not configured" });
    return;
  }

  if (isAdminAuthenticated(req)) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}

export function redirectIfUnauthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!isAdminConfigured()) {
    next();
    return;
  }

  if (isAdminAuthenticated(req)) {
    next();
    return;
  }

  res.redirect("/admin/login");
}

