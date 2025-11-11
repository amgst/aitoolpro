import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "admin"
  );
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

export function isPasswordValid(password: string | undefined): boolean {
  if (!password) return false;
  return password === getAdminPassword();
}

type TokenPayload = {
  iat: number;
  exp: number;
};

function encodePayload(payload: TokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): TokenPayload | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.iat === "number" &&
      typeof parsed.exp === "number"
    ) {
      return parsed as TokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function sign(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSessionToken(): string {
  const payload: TokenPayload = {
    iat: Date.now(),
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
  };
  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expectedSignature = sign(encodedPayload);
  try {
    const provided = Buffer.from(signature, "base64url");
    const expected = Buffer.from(expectedSignature, "base64url");
    if (
      provided.length !== expected.length ||
      !crypto.timingSafeEqual(provided, expected)
    ) {
      return false;
    }
  } catch {
    return false;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) return false;
  if (Date.now() > payload.exp) return false;
  return true;
}

export function parseCookies(
  header: string | undefined,
): Record<string, string> {
  if (!header) return {};
  return header.split(";").reduce((acc, cookie) => {
    const [name, ...rest] = cookie.split("=");
    if (!name) return acc;
    acc[name.trim()] = decodeURIComponent(rest.join("=").trim());
    return acc;
  }, {} as Record<string, string>);
}

export function serializeAdminSessionCookie(
  token: string,
  secure: boolean,
): string {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function serializeClearAdminSessionCookie(secure: boolean): string {
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

