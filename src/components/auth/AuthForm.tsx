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

      <div className="mt-6 text-center">
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
