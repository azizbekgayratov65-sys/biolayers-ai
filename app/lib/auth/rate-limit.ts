import "server-only";

/*
  Minimal in-memory sliding-window rate limiter.

  Compatible with Vercel: each serverless instance keeps its own
  bucket map, which is enough to stop a single user from spamming
  hundreds of simultaneous requests through one instance. It is not
  a global limiter.
*/

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/*
  Best-effort client IP for rate-limiting anonymous routes. On Vercel
  the platform sets x-forwarded-for, so its first entry is the client.
*/
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

const MAX_BUCKETS = 20_000;

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): {
  allowed: boolean;
  retryAfterMs: number;
} {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      retryAfterMs: 0,
    };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterMs: existing.resetAt - now,
    };
  }

  return {
    allowed: true,
    retryAfterMs: 0,
  };
}