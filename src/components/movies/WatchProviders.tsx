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
}

export default function WatchProviders({ providers }: WatchProvidersProps) {
  if (!providers || (!providers.stream?.length && !providers.rent?.length && !providers.buy?.length)) {
    return null; // No providers found
  }

  // Helper to render a group of providers
  const renderGroup = (title: string, items?: Provider[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">{title}</h4>
        <div className="flex flex-wrap gap-3">
          {items.map((provider) => (
            <div 
              key={provider.provider_id} 
              className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 shadow-lg hover:scale-110 transition-transform cursor-pointer group bg-black/50"
              title={provider.provider_name}
            >
              <Image 
                src={getImageUrl(provider.logo_path, "w500")}
                alt={provider.provider_name}
                fill
                className="object-cover"
                unoptimized // TMDB images
              />
              {/* Optional tooltip overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <span className="text-[10px] text-white font-bold text-center leading-tight px-1 drop-shadow-md">
                   {provider.provider_name}
                 </span>
              </div>
            </div>
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
            {providers.link && (
                <a 
                    href={providers.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-white transition-colors bg-accent/10 px-3 py-1.5 rounded-full font-medium"
                >
                    View All on TMDB →
                </a>
            )}
        </div>
        
        <div className="mt-5 space-y-1">
            {renderGroup("Stream", providers.stream)}
            {renderGroup("Rent", providers.rent)}
            {renderGroup("Buy", providers.buy)}
        </div>
    </div>
  );
}
