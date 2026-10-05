import crypto from "crypto";

const AUTH_SECRET =
  process.env.AUTH_SECRET || "mewmao_secure_auth_secret_k9x2m4p8q1v7w5";

export interface TokenPayload {
  role: "admin" | "seller";
  sub: string; // sellerId or "admin"
  affiliateCode?: string;
  exp: number; // unix timestamp in seconds
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

export function signToken(
  payload: Omit<TokenPayload, "exp">,
  expiresInSeconds: number = 7 * 24 * 3600
): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadStr = JSON.stringify(fullPayload);
  const encodedPayload = base64UrlEncode(payloadStr);

  const hmac = crypto.createHmac("sha256", AUTH_SECRET);
  hmac.update(encodedPayload);
  const signature = base64UrlEncode(hmac.digest("base64"));

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token?: string | null): TokenPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  try {
    const hmac = crypto.createHmac("sha256", AUTH_SECRET);
    hmac.update(encodedPayload);
    const expectedSignature = base64UrlEncode(hmac.digest("base64"));

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: TokenPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function extractCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === name) {
      return decodeURIComponent(v);
    }
  }
  return null;
}

export function verifyAdminSession(request: Request): boolean {
  // 1. Check HttpOnly cookie
  const cookieToken = extractCookie(request, "mewmao_admin_token");
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload && payload.role === "admin") return true;
  }

  // 2. Check Authorization Header fallback
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload && payload.role === "admin") return true;
  }

  return false;
}

export function getSellerSession(
  request: Request
): { sellerId: string; affiliateCode: string } | null {
  // 1. Check HttpOnly cookie
  const cookieToken = extractCookie(request, "mewmao_seller_token");
  if (cookieToken) {
    const payload = verifyToken(cookieToken);
    if (payload && payload.role === "seller" && payload.sub) {
      return {
        sellerId: payload.sub,
        affiliateCode: payload.affiliateCode || "",
      };
    }
  }

  // 2. Check Authorization Header fallback
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload && payload.role === "seller" && payload.sub) {
      return {
        sellerId: payload.sub,
        affiliateCode: payload.affiliateCode || "",
      };
    }
  }

  return null;
}
