export function getImageUrl(path: string | null | undefined, size: "w500" | "original" | "w780" | "w1280" = "w500") {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image"; 
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
