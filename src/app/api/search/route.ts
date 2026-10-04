import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";
import { checkRateLimit } from "@/lib/rate-limit";
import { filterCleanContent } from "@/lib/contentFilter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // 1. IP Rate Limiting (60 requests per minute for smooth typing)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limiter = checkRateLimit(`search_${ip}`, 60, 60000);

  if (!limiter.success) {
    console.warn(`[TMDB RATE LIMITED] IP ${ip} exceeded search rate limit.`);
    return NextResponse.json(
      { error: "Too many search requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": "10",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  // 2. Query extraction & normalization
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q") || "";
  const normalizedQuery = rawQuery.trim();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  try {
    const data = await fetchTMDB("/search/multi", {
      query: normalizedQuery,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });

    const rawResults = data?.results || [];
    const results: any[] = [];
    const seenIds = new Set<string>();

    for (const item of rawResults) {
      if (item.media_type === "movie" || item.media_type === "tv") {
        const key = `${item.media_type}_${item.id}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          results.push(item);
        }
      } else if (item.media_type === "person" && Array.isArray(item.known_for)) {
        // Surface shows/movies created by or starring the searched YouTuber/creator/actor
        for (const known of item.known_for) {
          if (known.media_type === "movie" || known.media_type === "tv") {
            const key = `${known.media_type}_${known.id}`;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              results.push(known);
            }
          }
        }
      }
    }

    // If results are limited, supplement with targeted TV search for Indian web series/shows
    if (results.length < 4) {
      try {
        const tvData = await fetchTMDB("/search/tv", {
          query: normalizedQuery,
          include_adult: "false",
          language: "en-US",
          page: "1",
        });
        if (tvData?.results) {
          for (const item of tvData.results) {
            const key = `tv_${item.id}`;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              results.push({ ...item, media_type: "tv" });
            }
          }
        }
      } catch (err) {
        // Fallback silently if secondary TV search encounters error
      }
    }

    const cleanResults = filterCleanContent(results);

    return NextResponse.json(
      { results: cleanResults },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[SEARCH ROUTE ERROR]:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
