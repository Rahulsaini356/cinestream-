const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append("api_key", TMDB_API_KEY || "");
  Object.entries(params).forEach(([key, value]) => searchParams.append(key, String(value)));

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("TMDB error on:", url);
    throw new Error(`TMDB Error: ${res.statusText}`);
  }
  return res.json();
}

export function getImageUrl(path: string | null | undefined, size: "w500" | "original" | "w780" | "w1280" = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image"; 
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getProviders(type: "movie" | "tv", id: string) {
  try {
    const data = await fetchTMDB(`/${type}/${id}/watch/providers`);
    // Defaulting to US or IN if available, fallback to first available
    const results = data.results || {};
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
