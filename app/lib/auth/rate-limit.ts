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