import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { fetchTMDB } from "@/lib/tmdb";
import { unstable_cache } from "next/cache";

const getCachedSitemapMedia = unstable_cache(
  async () => {
    console.log("[SITEMAP CACHE MISS] Regenerating dynamic sitemap URLs");
    const allItems = new Map<string | number, any>();

    const endpoints = ["/trending/movie/week", "/trending/tv/week", "/movie/popular", "/tv/popular"];

    const responses = await Promise.all(
      endpoints.map((ep) => fetchTMDB(ep, { page: "1" }).catch(() => ({ results: [] })))
    );

    responses.forEach((res: any) => {
      if (res?.results) {
        res.results.forEach((item: any) => {
          if (item?.id && !allItems.has(item.id)) {
            allItems.set(item.id, item);
          }
        });
      }
    });

    return Array.from(allItems.values());
  },
  ["cinestream-sitemap-media-v1"],
  {
    revalidate: 86400, // 24 Hours Cache
    tags: ["sitemap"],
  }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cinestream.digital";

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  let movieUrls: MetadataRoute.Sitemap = [];
  let tvUrls: MetadataRoute.Sitemap = [];

  try {
    const mediaItems = await getCachedSitemapMedia();

    const safeDate = (dateStr: string | undefined) => {
      if (!dateStr) return new Date();
      const parsed = new Date(dateStr);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    mediaItems.forEach((item: any) => {
      if (item.title || item.media_type === "movie") {
        movieUrls.push({
          url: `${baseUrl}/movie/${item.id}`,
          lastModified: safeDate(item.release_date),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      } else {
        tvUrls.push({
          url: `${baseUrl}/tv/${item.id}`,
          lastModified: safeDate(item.first_air_date),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        });
      }
    });
  } catch (error) {
    console.error("Sitemap dynamic fetch failed:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tv`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogUrls,
    ...movieUrls,
    ...tvUrls,
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
