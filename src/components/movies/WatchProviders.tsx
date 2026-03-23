import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";

interface Provider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
}

interface WatchProvidersProps {
  providers: {
    stream?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
    link?: string;
  } | null;
  title: string;
}

export default function WatchProviders({ providers, title }: WatchProvidersProps) {
  if (!providers || (!providers.stream?.length && !providers.rent?.length && !providers.buy?.length)) {
    return null; // No providers found
  }

  const getSearchUrl = (providerName: string) => {
    const query = encodeURIComponent(title);
    switch (providerName.toLowerCase()) {
      case 'netflix':
        return `https://www.netflix.com/search?q=${query}`;
      case 'amazon prime video':
      case 'prime video':
        return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${query}`;
      case 'disney+ hotstar':
      case 'disney+':
        return `https://www.hotstar.com/in/search?q=${query}`;
      case 'jiocinema':
        return `https://www.jiocinema.com/search/${query}`;
      case 'apple tv':
      case 'apple tv plus':
        return `https://tv.apple.com/search?term=${query}`;
      case 'google play movies':
        return `https://play.google.com/store/movies/search?q=${query}&c=movies`;
      default:
        return `https://www.google.com/search?q=Watch+${encodeURIComponent(title)}+on+${encodeURIComponent(providerName)}`;
    }
  };

  // Helper to render a group of providers
  const renderGroup = (groupTitle: string, items?: Provider[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">{groupTitle}</h4>
        <div className="flex flex-wrap gap-3">
          {items.map((provider) => (
            <a 
              key={provider.provider_id} 
              href={getSearchUrl(provider.provider_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg hover:scale-110 transition-transform cursor-pointer group bg-zinc-900 flex items-center justify-center p-0.5"
              title={provider.provider_name}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image 
                  src={getImageUrl(provider.logo_path, "w500")}
                  alt={provider.provider_name}
                  fill
                  className="object-cover"
                  unoptimized 
                />
              </div>
              {/* Optional tooltip overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-[10px] text-white font-bold text-center leading-tight px-1 drop-shadow-md">
                   {provider.provider_name}
                 </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 p-6 glass-morphism rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                🎬 Where to Watch
            </h3>
        </div>
        
        <div className="mt-5 space-y-1">
            {renderGroup("Stream", providers.stream)}
            {renderGroup("Rent", providers.rent)}
            {renderGroup("Buy", providers.buy)}
        </div>
    </div>
  );
}
