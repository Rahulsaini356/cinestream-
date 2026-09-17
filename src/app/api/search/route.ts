import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rate-limit";
import { unstable_cache } from "next/cache";

/**
 * Server-side cached search query handler (1 Hour TTL)
 * Normalizes query string to prevent duplicate TMDB calls for casing/spacing differences.
 */
const getCachedSearchResults = (normalizedQuery: string) =>
  unstable_cache(
    async () => {
      console.log(`[SEARCH CACHE MISS] Executing TMDB search for query: "${normalizedQuery}"`);
      const data = await fetchTMDB("/search/multi", {
        query: normalizedQuery,
        include_adult: "false",
        language: "en-US",
        page: "1",
      });

      const results = data?.results || [];
      return results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
    },
    [`search-query-${normalizedQuery}`],
    {
      revalidate: 3600, // 1 hour cache for search queries
      tags: ["search"],
    }
  )();

export async function GET(req: Request) {
  // 1. IP Rate Limiting (Strict 20 requests per minute)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limiter = checkRateLimit(`search_${ip}`, 20, 60000);

  if (!limiter.success) {
    console.warn(`[TMDB RATE LIMITED] IP ${ip} exceeded search rate limit (20 req/min).`);
    return NextResponse.json(
      { error: "Too many search requests. Please wait 1 minute." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // 2. Query extraction & normalization
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") || "";
  const normalizedQuery = rawQuery.trim().toLowerCase();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await getCachedSearchResults(normalizedQuery);
    return NextResponse.json({ results }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      }
    });
  } catch (error) {
    console.error("[SEARCH ROUTE ERROR]:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
