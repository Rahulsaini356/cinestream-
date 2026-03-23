import { NextResponse } from "next/server";
import { fetchTMDB } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await fetchTMDB("/search/multi", {
      query,
      include_adult: "false",
      language: "en-US",
      page: "1",
    });

    const filteredResults = data.results.filter(
      (item: any) => item.media_type === "movie" || item.media_type === "tv"
    );

    return NextResponse.json({ results: filteredResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
