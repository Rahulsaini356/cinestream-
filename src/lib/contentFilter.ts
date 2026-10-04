/**
 * Strict Content Filter to block Ullu, softcore, erotic, and vulgar 18+ content.
 * Keeps CineStream clean, safe, and family-friendly while preserving legitimate shows.
 */

export const VULGAR_EXCLUDED_NETWORKS = "2902"; // Ullu Network
export const VULGAR_EXCLUDED_COMPANIES = "134066,148435,160230,229073,128719"; // Ullu, Kooku Originals, Prime Shots, Voovi, Cineprime

const VULGAR_BRANDS = [
  "ullu",
  "kooku",
  "primeshots",
  "primeshorts",
  "cineprime",
  "voovi",
  "hotx",
  "hot-x",
  "hunters app",
  "hunters",
  "besharams",
  "moodx",
  "neonx",
  "fliz movies",
  "flizmovies",
  "rabbit movies",
  "nuefliks",
  "red prime",
  "redprime",
  "feneo",
  "gupchup",
  "boomx",
  "jalva app",
  "big movie zoo",
  "chikooflix",
  "look entertainment",
  "showx",
  "hitprime",
  "fenil entertainment",
  "yessma",
];

const VULGAR_TITLES = [
  "charmsukh",
  "palang tod",
  "kavita bhabhi",
  "riti riwaj",
  "mastram",
  "chachi no.1",
  "chachi no 1",
  "gandi baat",
  "gandii baat",
  "dunali",
  "choodiwala",
  "chudiwala",
  "tawano",
  "sursuri-li",
  "sursurili",
  "namkeen",
  "siskiyaan",
  "siskiyan",
  "farebi yaar",
  "walkman",
  "samne wali khidki",
  "love guru",
  "lady finger",
  "teekhi chatni",
  "matki",
  "chull",
  "jaal",
  "zulm",
  "mona home delivery",
  "rasleela",
  "gupt gyan",
  "khul ja sim sim",
  "kamini damini",
  "savita bhabhi",
  "devar bhabhi",
  "desi bhabhi",
  "sexy bhabhi",
  "sexy shila",
  "sunita bhabhi",
  "hot spot",
  "woodpecker",
  "halala",
  "panchali",
  "lahu bandhu",
  "flat 69",
  "client no.",
  "doodh wali",
  "maid in india",
];

const VULGAR_PHRASES = [
  "erotic web series",
  "erotic web-series",
  "erotic drama web-series",
  "erotic series",
  "erotic drama",
  "erotic thriller",
  "softcore",
  "seductive bhabhi",
  "pleasuring people",
  "pleasuring herself",
  "pleasuring himself",
  "sexual intimacy",
  "steamy encounters",
  "erotic fantasy",
  "erotic fantasies",
  "lustful desires",
  "sensual desires",
  "streamed on ullu",
  "ullu network",
  "kooku original",
  "primeshots original",
  "voovi original",
];

/**
 * Checks if a movie or TV show item is vulgar, erotic, or from adult platforms like Ullu.
 */
export function isVulgarOrAdult(item: any): boolean {
  if (!item) return false;

  // 1. Hard TMDB adult flag
  if (item.adult === true) return true;

  const title = (
    item.title ||
    item.name ||
    item.original_title ||
    item.original_name ||
    ""
  ).toLowerCase();

  const overview = (item.overview || "").toLowerCase();
  const text = `${title} ${overview}`;

  // 2. Check banned networks and production companies if present in object
  if (Array.isArray(item.networks)) {
    for (const net of item.networks) {
      const netName = (net?.name || "").toLowerCase();
      if (VULGAR_BRANDS.some((b) => netName.includes(b))) return true;
      if (net?.id === 2902) return true;
    }
  }

  if (Array.isArray(item.production_companies)) {
    for (const prod of item.production_companies) {
      const prodName = (prod?.name || "").toLowerCase();
      if (VULGAR_BRANDS.some((b) => prodName.includes(b))) return true;
      if ([134066, 148435, 160230, 229073, 128719].includes(prod?.id)) return true;
    }
  }

  // 3. Check vulgar/adult brands in title or overview text
  for (const brand of VULGAR_BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, "i");
    if (regex.test(text)) return true;
  }

  // 4. Check known adult show titles
  for (const vt of VULGAR_TITLES) {
    if (title.includes(vt)) return true;
  }

  // 5. Check vulgar phrases in overview
  for (const phrase of VULGAR_PHRASES) {
    if (overview.includes(phrase)) return true;
  }

  return false;
}

/**
 * Filters out all vulgar and adult titles from an array of movies/shows.
 */
export function filterCleanContent<T = any>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => !isVulgarOrAdult(item));
}
