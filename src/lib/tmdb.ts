import dns from "node:dns";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Fallback if environment doesn't allow setting DNS order
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append("api_key", TMDB_API_KEY || "");
  Object.entries(params).forEach(([key, value]) => searchParams.append(key, String(value)));

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000), // 8 seconds timeout to prevent IPv6 ETIMEDOUT hangs
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

export function getImageUrl(path: string | null | undefined, size: "w500" | "original" | "w780" | "w1280" = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image"; 
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

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
