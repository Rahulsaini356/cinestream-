import { cache } from "react";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env["TMDB_API_BASE_URL"] || "https://api.themoviedb.org/3";

/**
 * PRODUCTION-GRADE TMDB CIRCUIT BREAKER & PROTECTION STATE
 * Process-local state complemented by Next.js persistent Data Cache.
 */
interface CircuitBreaker {
  isOpen: boolean;
  openUntil: number;
  consecutive5xx: number;
}

const circuit: CircuitBreaker = {
  isOpen: false,
  openUntil: 0,
  consecutive5xx: 0,
};

const CIRCUIT_OPEN_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// In-Memory Request Coalescing (Single-Flight pattern) to prevent cache stampedes
const inFlightMap = new Map<string, Promise<any>>();

// L1 In-Memory Cache Store (Process-level across requests during lambda warmup)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const l1MemoryCache = new Map<string, CacheEntry>();

// Emergency Stale Cache Store for graceful degradation during TMDB outages / 429s
const staleCacheMap = new Map<string, { data: any; timestamp: number }>();

/**
 * Determine cache TTL based on TMDB endpoint
 */
function getEndpointTTL(endpoint: string): number {
  if (endpoint.includes("/search/")) return 3600; // 1 hour for search
  if (endpoint.includes("/genre/")) return 7 * 24 * 3600; // 7 days for genres
  if (endpoint.startsWith("/person/")) return 7 * 24 * 3600; // 7 days for person details
  if (
    endpoint.includes("/trending/") ||
    endpoint.includes("/popular") ||
    endpoint.includes("/top_rated") ||
    endpoint.includes("/now_playing")
  ) {
    return 2 * 3600; // 2 hours for popular/trending lists
  }
  if (endpoint.includes("/upcoming")) return 6 * 3600; // 6 hours for upcoming
  if (endpoint.startsWith("/movie/") || endpoint.startsWith("/tv/")) {
    return 24 * 3600; // 24 hours for individual movie/TV details
  }
  return 3600; // Default 1 hour
}

/**
 * Normalizes query parameters into a canonical sorted key
 */
function canonicalizeKey(endpoint: string, params: Record<string, string> = {}): {
  cacheKey: string;
  url: string;
  ttl: number;
  cacheTags: string[];
} {
  const sortedKeys = Object.keys(params).sort();
  const searchParams = new URLSearchParams();
  searchParams.append("api_key", TMDB_API_KEY || "");

  const keyParams = new URLSearchParams();
  for (const k of sortedKeys) {
    const val = params[k];
    if (val !== undefined && val !== null && val !== "") {
      searchParams.append(k, String(val));
      keyParams.append(k, String(val));
    }
  }

  const queryStr = keyParams.toString();
  const cacheKey = queryStr ? `${endpoint}?${queryStr}` : endpoint;
  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;
  const ttl = getEndpointTTL(endpoint);
  const tagSegment = endpoint.split("/")[1] || "general";
  const cacheTags = [`tmdb-${tagSegment}`];

  return { cacheKey, url, ttl, cacheTags };
}

/**
 * Low-level HTTP fetcher for TMDB with Next.js Data Cache, circuit breaker,
 * single retry for 5xx/network errors, and stale fallbacks.
 */
async function rawFetchTMDB(
  url: string,
  cacheKey: string,
  endpoint: string,
  ttl: number,
  cacheTags: string[]
) {
  const now = Date.now();

  // 1. Check Circuit Breaker
  if (circuit.isOpen) {
    if (now < circuit.openUntil) {
      console.warn(`[TMDB CIRCUIT OPEN] Endpoint ${endpoint} requested while circuit is OPEN. Serving stale fallback if available.`);
      const stale = staleCacheMap.get(cacheKey);
      if (stale) {
        console.log(`[TMDB STALE CACHE SERVED] ${endpoint}`);
        return stale.data;
      }
      return { results: [], success: false, circuitOpen: true };
    } else {
      circuit.isOpen = false;
      circuit.consecutive5xx = 0;
      console.log(`[TMDB CIRCUIT HALF-OPEN] Cooldown expired. Testing endpoint ${endpoint}`);
    }
  }

  let attempt = 0;
  const maxAttempts = 2; // Strict MAX 1 RETRY for 5xx/network errors

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`[TMDB FETCH] endpoint=${endpoint} attempt=${attempt}/${maxAttempts}`);

    try {
      // Use Next.js native Data Cache options so responses are cached by Next.js & Netlify Blobs!
      const res = await fetch(url, {
        headers: {
          "User-Agent": "CineStream/2.0 (Server-Side; Security-Protected)",
          "Accept": "application/json",
        },
        next: {
          revalidate: ttl,
          tags: cacheTags,
        },
        signal: AbortSignal.timeout(6000), // 6s timeout
      });

      // Handle Rate Limit (HTTP 429)
      if (res.status === 429) {
        const retryAfterHeader = res.headers.get("Retry-After");
        const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : CIRCUIT_OPEN_DURATION_MS;

        circuit.isOpen = true;
        circuit.openUntil = Date.now() + Math.max(retryAfterMs, CIRCUIT_OPEN_DURATION_MS);

        console.error(`[TMDB 429 RATE LIMIT] Quota exceeded on ${endpoint}. Circuit breaker tripped until ${new Date(circuit.openUntil).toISOString()}`);

        const stale = staleCacheMap.get(cacheKey);
        if (stale) return stale.data;
        return { results: [], success: false, error: "Rate limit exceeded" };
      }

      // Handle Server Errors (HTTP 5xx)
      if (res.status >= 500) {
        circuit.consecutive5xx++;
        console.error(`[TMDB 5XX ERROR] Status ${res.status} on ${endpoint} (consecutive: ${circuit.consecutive5xx})`);

        if (circuit.consecutive5xx >= 3) {
          circuit.isOpen = true;
          circuit.openUntil = Date.now() + CIRCUIT_OPEN_DURATION_MS;
          console.error(`[TMDB CIRCUIT OPEN] 3 consecutive 5xx errors. Tripping circuit breaker for 5 minutes.`);
        }

        if (attempt < maxAttempts) {
          console.log(`[TMDB RETRY BACKOFF] Retrying 5xx error on ${endpoint} in 500ms...`);
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        const stale = staleCacheMap.get(cacheKey);
        if (stale) return stale.data;
        return { results: [], success: false };
      }

      // Handle 4xx Client Errors (400, 401, 403, 404) - DO NOT RETRY
      if (!res.ok) {
        console.error(`[TMDB CLIENT ERROR] HTTP ${res.status}: ${res.statusText} on ${endpoint}`);
        return { results: [], success: false };
      }

      // Successful Response
      const data = await res.json();

      // Reset 5xx counter on success
      circuit.consecutive5xx = 0;

      // Store in L1 Memory Cache
      l1MemoryCache.set(cacheKey, { data, expiresAt: Date.now() + (ttl * 1000) });

      // Store in stale cache for emergency fallback
      staleCacheMap.set(cacheKey, { data, timestamp: Date.now() });

      // Bound memory cache size
      if (l1MemoryCache.size > 500) {
        const pruneNow = Date.now();
        for (const [k, v] of l1MemoryCache.entries()) {
          if (v.expiresAt < pruneNow) l1MemoryCache.delete(k);
        }
      }

      return data;
    } catch (error: any) {
      console.error(`[TMDB NETWORK ERROR] Attempt ${attempt} failed on ${endpoint}:`, error?.message || error);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      const stale = staleCacheMap.get(cacheKey);
      if (stale) return stale.data;
      return { results: [], success: false };
    }
  }

  return { results: [], success: false };
}

/**
 * React Server Component per-request memoization keyed on string primitive.
 * Guarantees generateMetadata() and Page components on the same request share 1 promise.
 */
const rscMemoizedFetch = cache(async (canonicalKey: string): Promise<any> => {
  // 1. Check L1 In-Memory Cache first (0ms instantaneous return)
  const l1Entry = l1MemoryCache.get(canonicalKey);
  if (l1Entry && Date.now() < l1Entry.expiresAt) {
    return l1Entry.data;
  }

  // 2. Single-flight request coalescing for concurrent in-flight fetches
  if (inFlightMap.has(canonicalKey)) {
    console.log(`[TMDB SINGLE-FLIGHT COALESCED] Sharing active in-flight fetch for ${canonicalKey}`);
    return await inFlightMap.get(canonicalKey);
  }

  const [endpoint, queryString] = canonicalKey.split("?");
  const params: Record<string, string> = {};
  if (queryString) {
    const sp = new URLSearchParams(queryString);
    sp.forEach((v, k) => {
      params[k] = v;
    });
  }

  const { url, ttl, cacheTags } = canonicalizeKey(endpoint, params);

  const fetchPromise = rawFetchTMDB(url, canonicalKey, endpoint, ttl, cacheTags);
  inFlightMap.set(canonicalKey, fetchPromise);

  try {
    const result = await fetchPromise;
    return result;
  } finally {
    inFlightMap.delete(canonicalKey);
  }
});

/**
 * Public TMDB API fetcher used across CineStream.
 * Handles canonical key generation, React RSC deduplication, and Next.js Data Cache.
 */
export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const { cacheKey } = canonicalizeKey(endpoint, params);
  return await rscMemoizedFetch(cacheKey);
}

export { getImageUrl } from "./tmdb-client";

/**
 * Extract streaming providers without making separate TMDB network requests if already present.
 */
export async function getProviders(type: "movie" | "tv", id: string, existingData?: any) {
  try {
    // 1. Extract from existing append_to_response object if available (0 EXTRA REQUESTS)
    const rawResults =
      existingData?.["watch/providers"]?.results ||
      existingData?.watch_providers?.results ||
      existingData?.providers?.results;

    if (rawResults) {
      console.log(`[TMDB PROVIDERS EXTRACTED] Reused provider data from ${type}/${id} response (0 extra network calls)`);
      const regionData = rawResults["IN"] || rawResults["US"] || Object.values(rawResults)[0];
      if (regionData) {
        return {
          stream: (regionData as any).flatrate || [],
          rent: (regionData as any).rent || [],
          buy: (regionData as any).buy || [],
          link: (regionData as any).link || "",
        };
      }
    }

    // 2. Fallback to cached TMDB fetch if not embedded
    const data = await fetchTMDB(`/${type}/${id}/watch/providers`);
    const results = data?.results || {};
    const regionData = results["IN"] || results["US"] || Object.values(results)[0];

    if (!regionData) return null;

    return {
      stream: regionData.flatrate || [],
      rent: regionData.rent || [],
      buy: regionData.buy || [],
      link: regionData.link || "",
    };
  } catch (error) {
    console.error(`[TMDB PROVIDERS ERROR] Error fetching providers for ${type}/${id}:`, error);
    return null;
  }
}
