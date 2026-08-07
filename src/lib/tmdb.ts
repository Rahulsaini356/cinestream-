const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env["TMDB_API_BASE_URL"] || "https://api.themoviedb.org/3";

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append("api_key", TMDB_API_KEY || "");
  Object.entries(params).forEach(([key, value]) => searchParams.append(key, String(value)));

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000), // 8 seconds timeout to prevent hanging
    });

    if (!res.ok) {
      console.error(`TMDB HTTP Error ${res.status}: ${res.statusText} on ${endpoint}`);
      return { results: [], success: false };
    }

    return await res.json();
  } catch (error: any) {
    console.error(`TMDB fetch failed on ${endpoint}:`, error?.message || error);
    return { results: [], success: false };
  }
}

export { getImageUrl } from "./tmdb-client";

export async function getProviders(type: "movie" | "tv", id: string) {
  try {
    const data = await fetchTMDB(`/${type}/${id}/watch/providers`);
    const results = data?.results || {};
    const regionData = results["IN"] || results["US"] || Object.values(results)[0];
    
    if (!regionData) return null;

    return {
      stream: regionData.flatrate || [],
      rent: regionData.rent || [],
      buy: regionData.buy || [],
      link: regionData.link || ""
    };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return null;
  }
}
