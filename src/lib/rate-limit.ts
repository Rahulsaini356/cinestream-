interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

/**
 * In-Memory Sliding Window Rate Limiter
 * @param identifier Key to track (e.g. IP address or Email)
 * @param limit Max allowed attempts in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, resetTime };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count, resetTime: record.resetTime };
}
