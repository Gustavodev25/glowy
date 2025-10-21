// lib/rateLimit.ts
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const rec = buckets.get(key);
  if (!rec || now > rec.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (rec.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: rec.resetAt };
  }
  rec.count += 1;
  return { allowed: true, remaining: limit - rec.count, resetAt: rec.resetAt };
}

