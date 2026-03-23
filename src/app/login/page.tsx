"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { Film, PlayCircle, Tv } from "lucide-react";

const BACKDROPS_DATA = [
  {
    src: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=1974&auto=format&fit=crop",
    title: "The Batman",
    category: "Action &middot; Crime"
  },
  {
    src: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=2070&auto=format&fit=crop",
    title: "Dune",
    category: "Sci-Fi &middot; Adventure"
  },
  {
    src: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop",
    title: "Oppenheimer",
    category: "Drama &middot; History"
  },
  {
    src: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=2070&auto=format&fit=crop",
    title: "Interstellar",
    category: "Sci-Fi &middot; Drama"
  },
  {
    src: "https://images.unsplash.com/photo-1618519764620-7403abdbdda9?q=80&w=2070&auto=format&fit=crop",
    title: "Spider-Man",
    category: "Animation &middot; Action"
  },
  {
    src: "https://images.unsplash.com/photo-1463947628408-f8581a2f4acc?q=80&w=2070&auto=format&fit=crop",
    title: "Avatar",
    category: "Sci-Fi &middot; Action"
  }
];

export default function LoginPage() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKDROPS_DATA.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentMovie = BACKDROPS_DATA[bgIndex];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black selection:bg-accent selection:text-white">
      {/* Background Slideshow */}
      {BACKDROPS_DATA.map((item, index) => (
        <div
          key={item.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url('${item.src}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === bgIndex ? 0.4 : 0,
            zIndex: 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-[1]" />

      {/* Header */}
      <header className="relative z-10 pt-10 px-6 md:px-12 flex flex-col gap-1 items-start">
        <div className="flex items-center gap-2 text-accent">
          <h1 className="text-3xl font-extrabold tracking-widest text-red-600">CINE<span className="text-white">STREAM</span></h1>
        </div>
        <p className="text-[10px] tracking-[0.2em] text-zinc-400 font-medium uppercase">Your Universe of Entertainment</p>
      </header>

      {/* Main Form */}
      <main className="relative z-10 flex-1 flex items-center justify-start px-6 md:px-16 lg:px-24">
        <div className="w-full max-w-md pt-8 md:pt-0">
          <AuthForm />
        </div>
        
        <div className="hidden lg:block absolute bottom-40 right-20 text-white max-w-sm transition-all duration-1000">
          <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded text-xs font-bold tracking-wider mb-2 inline-block">NOW STREAMING</span>
          <h2 className="text-5xl font-extrabold tracking-tight mb-2">{currentMovie.title}</h2>
          <p className="text-zinc-400 text-sm" dangerouslySetInnerHTML={{ __html: currentMovie.category }} />
        </div>
      </main>

      {/* Footer / OTT Logos */}
      <footer className="relative z-10 py-10 px-4 flex flex-col items-center gap-6">
        <div className="flex gap-2 mb-2">
          {BACKDROPS_DATA.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === bgIndex ? "w-6 bg-red-600" : "w-3 bg-zinc-600"}`} />
          ))}
        </div>
        
        <p className="text-xxs uppercase tracking-wider text-zinc-500">Stream on</p>
        <div className="flex items-center gap-4 justify-center opacity-70 hover:opacity-100 transition-opacity">
          <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-4 object-contain brightness-90 hover:scale-110 transition-transform" />
          </a>
          <div className="h-3 w-[1px] bg-white/10" />
          <a href="https://www.primevideo.com" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" alt="Prime" className="h-4 object-contain brightness-200 hover:scale-110 transition-transform" />
          </a>
          <div className="h-3 w-[1px] bg-white/10" />
          <a href="https://www.disneyplus.com" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" alt="Disney" className="h-5 object-contain brightness-100 hover:scale-110 transition-transform" />
          </a>
        </div>
        <p className="text-xxs text-zinc-600 mt-2">By continuing you agree to our <a href="/terms" className="hover:underline">Terms</a> & <a href="/privacy" className="hover:underline">Privacy Policy</a></p>
      </footer>
    </div>
  );
}
