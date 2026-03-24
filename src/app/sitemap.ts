import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog';
import { fetchTMDB } from '@/lib/tmdb';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cinestream.digital';

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  let movieUrls: MetadataRoute.Sitemap = [];
  let tvUrls: MetadataRoute.Sitemap = [];

  try {
    const trendingMovies = await fetchTMDB('/trending/movie/week');
    const trendingTv = await fetchTMDB('/trending/tv/week');
    
    movieUrls = (trendingMovies.results || []).map((item: any) => ({
      url: `${baseUrl}/movie/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    tvUrls = (trendingTv.results || []).map((item: any) => ({
      url: `${baseUrl}/tv/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Sitemap dynamic fetch failed:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tv`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
    ...movieUrls,
    ...tvUrls,
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
