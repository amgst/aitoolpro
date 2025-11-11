import type { Request, Response, NextFunction } from "express";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  getAdminPassword,
  parseCookies,
  verifySessionToken,
} from "../shared/adminAuth.js";

function getSessionToken(req: Request): string | undefined {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_COOKIE_NAME];
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword());
}

export function isAdminAuthenticated(req: Request): boolean {
  const token = getSessionToken(req);
  return verifySessionToken(token);
}

export function setAdminSession(res: Response): void {
  const token = createSessionToken();
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    path: "/",
  });
}

export function clearAdminSession(_req: Request, res: Response): void {
  res.cookie(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
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

