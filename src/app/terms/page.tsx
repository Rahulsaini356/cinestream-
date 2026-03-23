import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:underline mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Terms & Conditions</h1>
        
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>Welcome to CineStream. By accessing or using our service, you agree to be bound by these Terms.</p>
          
          <h2 className="text-xl font-semibold text-white mt-8">1. Use of Service</h2>
          <p>You may use the Service only for lawful purposes and in accordance with these Terms.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Accounts</h2>
          <p>When you create an account, you must provide accurate information. You are responsible for safeguarding your password.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of CineStream and its licensors.</p>

          <p className="text-xs text-zinc-500 mt-12">Last Updated: March 2026</p>
        </div>
      </div>
    </main>
  );
}
