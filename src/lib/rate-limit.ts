// Simple in-memory rate limiter for single-server (SQLite) apps
// Not suitable for multi-instance deployments — use Redis in production.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries to avoid memory leaks
const CLEANUP_INTERVAL = 60_000; // every minute
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Check if a request is allowed under the rate limit.
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}

/**
 * Helpers to get the client IP from a NextRequest.
 */
export function getClientIp(request: Request): string {
  // X-Forwarded-For is set by the gateway / reverse proxy
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Fallback to a unique identifier
  return request.headers.get("x-real-ip") || "unknown";
}
