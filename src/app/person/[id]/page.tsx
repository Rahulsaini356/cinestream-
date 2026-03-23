import { fetchTMDB, getImageUrl } from "@/lib/tmdb";
import Link from "next/link";
import { Star } from "lucide-react";

export default async function PersonDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const person = await fetchTMDB(`/person/${id}`, {
    append_to_response: "combined_credits",
  });

  const knownFor = person.combined_credits?.cast
    ?.filter((item: any, index: number, self: any[]) => index === self.findIndex((t: any) => t.id === item.id))
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    .slice(0, 10) || [];

  return (
    <main className="min-h-screen bg-black pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Photo */}
        <div className="w-48 md:w-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-zinc-900">
          <img src={getImageUrl(person.profile_path, "w500")} alt={person.name} className="w-full object-cover" />
        </div>

        {/* Bio */}
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-xl">{person.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-6">
            <span>{person.known_for_department}</span>
            {person.birthday && <span>Born: {person.birthday}</span>}
            {person.place_of_birth && <span>Place of Birth: {person.place_of_birth}</span>}
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">Biography</h2>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {person.biography || "We don't have a biography for this person."}
          </p>
        </div>
      </div>

      {/* Known For */}
      {knownFor.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Known For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {knownFor.map((item: any) => (
              <Link key={item.id} href={`/${item.media_type === "tv" ? "tv" : "movie"}/${item.id}`} className="group relative flex flex-col gap-2 border border-white/5 bg-zinc-900/50 p-2 rounded-xl hover:bg-zinc-800 transition-colors">
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-800 shadow-md">
                  {item.poster_path ? (
                    <img src={getImageUrl(item.poster_path, "w500")} alt={item.title || item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">No Image</div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-zinc-100 truncate mt-1">{item.title || item.name}</h3>
                  <p className="text-xs text-zinc-500 truncate">{item.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
