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
    // Fetch multiple pages from multiple categories to generate a massive sitemap
    const movieEndpoints = [
      '/trending/movie/week',
      '/movie/popular',
      '/movie/top_rated',
      '/movie/upcoming'
    ];
    
    const tvEndpoints = [
      '/trending/tv/week',
      '/tv/popular',
      '/tv/top_rated',
      '/tv/on_the_air'
    ];

    const fetchPages = async (endpoints: string[], maxPages = 3) => {
      const allItems = new Map();
      
      const fetchPromises = [];
      for (const endpoint of endpoints) {
        for (let page = 1; page <= maxPages; page++) {
          fetchPromises.push(
            fetchTMDB(endpoint, { page: page.toString() }).catch(() => ({ results: [] }))
          );
        }
      }
      
      const responses = await Promise.all(fetchPromises);
      
      responses.forEach((response: any) => {
        if (response?.results) {
          response.results.forEach((item: any) => {
            if (item.id && !allItems.has(item.id)) {
              allItems.set(item.id, item);
            }
          });
        }
      });
      
      return Array.from(allItems.values());
    };

    const [allMovies, allTvShows] = await Promise.all([
      fetchPages(movieEndpoints, 3), // ~240 unique movies
      fetchPages(tvEndpoints, 3)     // ~240 unique TV shows
    ]);
    
    movieUrls = allMovies.map((item: any) => ({
      url: `${baseUrl}/movie/${item.id}`,
      lastModified: item.release_date ? new Date(item.release_date) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    tvUrls = allTvShows.map((item: any) => ({
      url: `${baseUrl}/tv/${item.id}`,
      lastModified: item.first_air_date ? new Date(item.first_air_date) : new Date(),
      changeFrequency: 'weekly' as const,
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
