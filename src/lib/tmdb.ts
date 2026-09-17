import { cache } from "react";
import { unstable_cache } from "next/cache";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env["TMDB_API_BASE_URL"] || "https://api.themoviedb.org/3";

/**
 * PRODUCTION-GRADE TMDB CIRCUIT BREAKER & PROTECTION STATE
 * Note: Process-local state. Functions across serverless / multi-instance workers
 * complemented by Next.js persistent unstable_cache.
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

// Secondary Stale Cache Store for graceful degradation during TMDB outages / 429s
const staleCacheMap = new Map<string, { data: any; timestamp: number }>();

/**
 * Determine cache TTL based on TMDB endpoint
 */
function getEndpointTTL(endpoint: string): number {
  if (endpoint.includes("/search/")) return 3600; // 1 hour for search
  if (endpoint.includes("/genre/")) return 7 * 24 * 3600; // 7 days for genres
  if (endpoint.startsWith("/movie/") || endpoint.startsWith("/tv/")) {
    if (endpoint.includes("/trending/") || endpoint.includes("/popular") || endpoint.includes("/top_rated") || endpoint.includes("/now_playing")) {
      return 2 * 3600; // 2 hours for popular/trending lists
    }
    if (endpoint.includes("/upcoming")) return 6 * 3600; // 6 hours for upcoming
    return 24 * 3600; // 24 hours for individual movie/TV details
  }
  return 3600; // Default 1 hour
}

/**
 * Low-level HTTP fetcher for TMDB with circuit breaker, single retry for 5xx, and stale fallbacks
 */
async function rawFetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
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
      // Cooldown expired, move to half-open
      circuit.isOpen = false;
      circuit.consecutive5xx = 0;
      console.log(`[TMDB CIRCUIT HALF-OPEN] Cooldown expired. Testing endpoint ${endpoint}`);
    }
  }

  // 2. Prepare URL & Headers (Security: Key remains strictly server-side)
  const searchParams = new URLSearchParams();
  searchParams.append("api_key", TMDB_API_KEY || "");
  Object.entries(params).forEach(([key, value]) => searchParams.append(key, String(value)));

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  let attempt = 0;
  const maxAttempts = 2; // Strict MAX 1 RETRY for 5xx/network errors

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`[TMDB FETCH] endpoint=${endpoint} attempt=${attempt}/${maxAttempts}`);

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "CineStream/2.0 (Server-Side; Security-Protected)",
          "Accept": "application/json",
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

      // Store in stale cache for emergency fallback
      staleCacheMap.set(cacheKey, { data, timestamp: Date.now() });

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
 * Next.js Server-Level Cached Fetcher
 */
function createCachedTMDBFetcher(endpoint: string, params: Record<string, string>) {
  const ttl = getEndpointTTL(endpoint);
  const cacheTags = [`tmdb-${endpoint.split("/")[1] || "general"}`];

  return unstable_cache(
    async () => {
      console.log(`[TMDB CACHE MISS] Fetching fresh data for endpoint=${endpoint}`);
      return await rawFetchTMDB(endpoint, params);
    },
    [endpoint, JSON.stringify(params)],
    {
      revalidate: ttl,
      tags: cacheTags,
    }
  );
}

/**
 * REQUEST COALESCING (Single-Flight) + REACT CACHE (Per-Request Deduplication)
 * Main entry point for all TMDB queries across CineStream.
 */
export const fetchTMDB = cache(async (endpoint: string, params: Record<string, string> = {}) => {
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;

  // 1. Check if an identical request is already in-flight (Single-Flight Coalescing)
  if (inFlightMap.has(cacheKey)) {
    console.log(`[TMDB SINGLE-FLIGHT COALESCED] Sharing active in-flight fetch for ${endpoint}`);
    return await inFlightMap.get(cacheKey);
  }

  // 2. Create the cached execution promise
  const cachedFetcher = createCachedTMDBFetcher(endpoint, params);
  const promise = cachedFetcher();

  // Store in in-flight map
  inFlightMap.set(cacheKey, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    // Clean up in-flight map once resolved/rejected
    inFlightMap.delete(cacheKey);
  }
});

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
