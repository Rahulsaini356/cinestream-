import { ShieldAlert, Info } from "lucide-react";

export const metadata = {
  title: "Disclaimer & DMCA - CineStream",
  description: "CineStream Disclaimer and DMCA copyright policy regarding third-party hosted content.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-accent/10 text-accent mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Disclaimer & DMCA
          </h1>
          <p className="text-zinc-400">Last updated: March 2026</p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <section className="bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-accent" /> Content Hosting Policy
            </h2>
            <p className="text-sm leading-relaxed">
              CineStream (<strong className="text-white">cinestream.digital</strong>) does <strong>NOT</strong> host, stream, or upload any video, media files, or copyrighted material on its own servers. 
            </p>
            <p className="text-sm mt-3 leading-relaxed">
              All video streams, movies, or TV episodes made available via our continuous interface are loaded from external, third-party hosting providers and server indexing APIs. We acts purely as an indexer/search-structure of available metadata.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">DMCA Copyright Infringement</h2>
            <p className="text-sm leading-relaxed">
              We respect the intellectual property rights of others. Since CineStream does not host any file, any complaints regarding copyright infringement should be addressed directly to the third-party platforms hosting the media files (the source location).
            </p>
            <p className="text-sm leading-relaxed">
              However, if you are a copyright owner and believe that any content linked through this website infringes upon your copyright, you may notify us for link removal requests.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Removal Requests</h2>
            <p className="text-sm leading-relaxed">
              To request a removal of a specific embedded content reference link, please contact us with the following details:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-zinc-400">
              <li>Name and contact details of the copyright holder.</li>
              <li>Proof of ownership or authorization to act on behalf of the owner.</li>
              <li>The exact URL of the detail page on CineStream you wish to clear.</li>
            </ul>
            <p className="text-sm mt-2 text-accent">
              Email your requests to: <span className="underline">support@cinestream.digital</span>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">Accuracy of Information</h2>
            <p className="text-sm leading-relaxed">
              While we strive to provide accurate information, rating points, casting records, and general metadata are fetched from TMDB APIs and external sources. CineStream guarantees no absolute accuracy of the media descriptions.
            </p>
          </section>

          <section className="bg-zinc-900/40 p-5 rounded-xl border border-white/5 text-center">
            <p className="text-xs text-zinc-500">
              By using our streaming capabilities and browsing platform, you acknowledge and agree that CineStream carries no liability for any malicious ads or redirects occurring inside external media player frames. Use of an AdBlocker is strictly advised.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
