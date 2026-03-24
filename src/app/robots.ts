import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cinestream.digital';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Disallow Google from indexing private user pages or APIs
      disallow: ['/api/', '/profile', '/watchlist'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
