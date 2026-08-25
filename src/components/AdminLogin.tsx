import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  Building2,
  Sparkles,
  HelpCircle,
  X,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { loginAdmin, AdminUser } from "../services/authService";

interface AdminLoginProps {
  onSuccess: (user: AdminUser) => void;
  onBackToSite?: () => void;
}

export default function AdminLogin({ onSuccess, onBackToSite }: AdminLoginProps) {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter both email/username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAdmin(identifier.trim(), password, rememberMe);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.error || t("invalid_credentials"));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier("admin@esayas.com");
    setPassword("admin123");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col relative overflow-hidden selection:bg-gold selection:text-dark">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cinematic-gradient pointer-events-none opacity-40" />

      {/* Header bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToSite || (() => { window.location.href = "/"; })}
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-gold transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{t("back_to_site")}</span>
        </button>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-surface/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 relative"
        >
          {/* Top badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full ring-4 ring-surface" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                {t("admin_portal")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-white mb-2">
              {t("admin_login")}
            </h1>
            <p className="text-white/50 text-xs sm:text-sm font-light max-w-xs leading-relaxed">
              {t("admin_login_subtitle")}
            </p>
          </div>

          {/* Error message alert */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-start gap-3 text-red-300 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400/60 hover:text-red-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-identifier"
                className="block text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium"
              >
                {t("email_or_username")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  id="admin-identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t("enter_email")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] uppercase tracking-[0.2em] text-white/70 font-medium"
                >
                  {t("password")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] uppercase tracking-wider text-gold hover:underline transition-all"
                >
                  {t("forgot_password")}
                </button>
              </div>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-4 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("enter_password")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-white/40 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white/70 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold focus:ring-gold focus:ring-offset-0 transition-colors accent-gold"
                />
                <span>{t("remember_me")}</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-gold to-[#d4af37] text-dark py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-dark" />
                  <span>{t("signing_in")}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t("sign_in")}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center text-center">
            <div className="text-[11px] text-white/40 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold/60" />
              <span>{t("demo_credentials_hint")}</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-gold/80 hover:text-gold hover:underline transition-colors uppercase tracking-widest font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Auto-Fill Default Credentials</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 py-6 text-center text-white/20 text-[10px] uppercase tracking-[0.3em]">
        @2026 Gudeta Technologies. All Rights Reserved.
      </footer>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="fixed inset-0 bg-dark/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gold">
                  <HelpCircle className="w-5 h-5" />
                  <h3 className="font-serif text-lg text-white">
                    {t("forgot_password")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-white/40 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/70 leading-relaxed mb-6">
                {t("contact_sysadmin")}
              </p>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/60 mb-6 space-y-1">
                <div>Default Login: <span className="text-gold font-mono">admin@esayas.com</span></div>
                <div>Default Password: <span className="text-gold font-mono">admin123</span></div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-gold text-dark py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                {t("close")}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
