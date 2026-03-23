import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.</p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly, such as email and registration details.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Information</h2>
          <p>We use the information to maintain your profile, manage watchlists, and secure your session.</p>

          <p className="text-xs text-zinc-500 mt-12">Last Updated: March 2026</p>
        </div>
      </div>
    </main>
  );
}
