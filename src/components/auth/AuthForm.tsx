"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, User, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import ForgotPasswordModal from "./ForgotPasswordModal";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP (only for signup)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate strong password
    const validatePassword = (pass: string) => {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return regex.test(pass);
    };

    if (!validatePassword(formData.password)) {
      setError("Password must be 8+ chars and contain uppercase, lowercase, numbers & special character (@$!%*?&)");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Auto login after registration
      await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          {isLogin ? "Welcome back" : step === 1 ? "Create account" : "Verify email"}
        </h2>
        <p className="text-sm text-zinc-400 text-center">
          {isLogin
            ? "Sign in to discover new movies and shows"
            : step === 1
            ? "Enter your details to get started"
            : `We sent a code to ${formData.email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form method="POST" onSubmit={isLogin ? handleLogin : step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-4">
        {!isLogin && step === 1 && (
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              name="name"
              type="text"
              required
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        )}

        {(isLogin || step === 1) && (
          <>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {isLogin && (
              <div className="flex justify-end !mt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-zinc-400 hover:text-accent transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </>
        )}

        {!isLogin && step === 2 && (
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
            <input
              name="otp"
              type="text"
              required
              placeholder="6-digit OTP Code"
              maxLength={6}
              value={formData.otp}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 text-center tracking-[0.5em] font-mono text-lg bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative flex items-center justify-center py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              {isLogin ? "Sign In" : step === 1 ? "Send Verification Code" : "Verify & Create Account"}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </button>
      </form>

      {/* --- OR divider --- */}
      {(isLogin || step === 1) && (
        <>
          <div className="relative flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white font-medium mt-3 group"
          >
            {/* Google SVG logo */}
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm">Continue with Google</span>
          </button>
        </>
      )}

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setStep(1);
            setError("");
          }}
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
}
