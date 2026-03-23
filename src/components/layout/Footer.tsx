import Link from "next/link";
import { Film, PlayCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-black border-t border-white/5 text-zinc-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-accent">
          <Film className="w-6 h-6" />
          <span className="text-lg font-bold text-white tracking-tighter">CineStream</span>
        </div>

        <p className="text-sm">
          &copy; {currentYear} CineStream. All rights reserved.
        </p>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
