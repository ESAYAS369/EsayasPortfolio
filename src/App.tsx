import Hero from "./components/Hero";
import PropertyList from "./components/PropertyList";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import AIChat from "./components/AIChat";
import LanguageSwitcher from "./components/LanguageSwitcher";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  isAuthenticated,
  onAuthStateChanged,
  verifyCurrentSession,
} from "./services/authService";

// Heavy, conditionally-shown components load on demand so anonymous
// visitors don't download the admin dashboard/forms up front.
const ViewingForm = lazy(() => import("./components/ViewingForm"));
import {
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Building2,
  Menu,
  X,
  ShieldCheck,
  Lock,
} from "lucide-react";
import {
  getSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from "./services/propertyService";

// lucide-react has no TikTok brand icon, so we ship a small inline one.
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-label="TikTok"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function App() {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(isAuthenticated());
  const [isViewingFormOpen, setIsViewingFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasOpenedViewingForm, setHasOpenedViewingForm] = useState(false);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    void getSiteSettings().then(setSiteSettings);
  }, []);

  useEffect(() => {
    // Verify stored session validity on mount
    void verifyCurrentSession().then((valid) => {
      setIsAdminLoggedIn(valid);
    });

    const unsubscribe = onAuthStateChanged((user) => {
      setIsAdminLoggedIn(Boolean(user));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isViewingFormOpen) setHasOpenedViewingForm(true);
  }, [isViewingFormOpen]);

  const normalizedPath = currentPath.toLowerCase().replace(/\/+$/, "") || "/";
  const isAdminRoute =
    normalizedPath === "/admin" ||
    normalizedPath === "/adminlogin" ||
    normalizedPath === "/admin-login" ||
    normalizedPath === "/login" ||
    normalizedPath === "/signin";

  // If viewing the admin or login route
  if (isAdminRoute) {
    if (isAdminLoggedIn) {
      return (
        <AdminDashboard
          onClose={() => navigateTo("/")}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            navigateTo("/AdminLogin");
          }}
        />
      );
    }
    return (
      <AdminLogin
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          navigateTo("/admin");
        }}
        onBackToSite={() => navigateTo("/")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark selection:bg-gold selection:text-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-8 flex justify-between items-center gap-2 bg-gradient-to-b from-dark/80 to-transparent backdrop-blur-sm">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo("/");
          }}
          className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer"
        >
          <div className="bg-gold p-1.5 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-dark" />
          </div>
          <div className="text-base sm:text-xl font-serif tracking-[0.1em] uppercase truncate">
            {siteSettings.siteName}
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8 lg:gap-12 text-xs uppercase tracking-[0.3em] font-medium text-white/60">
          <a href="#listings" className="hover:text-gold transition-colors">
            {t("properties")}
          </a>
          <a href="#about" className="hover:text-gold transition-colors">
            {t("about")}
          </a>
          <a href="#services" className="hover:text-gold transition-colors">
            {t("services")}
          </a>
          <a href="#contact" className="hover:text-gold transition-colors">
            {t("contact")}
          </a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setIsViewingFormOpen(true)}
            className="hidden md:block bg-white text-dark px-4 lg:px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-gold transition-colors whitespace-nowrap cursor-pointer"
          >
            {t("inquiry")}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white/80 hover:text-gold transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-dark/90 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[95] w-[80%] max-w-sm bg-surface border-l border-white/10 flex flex-col md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="bg-gold p-1.5 rounded-lg shrink-0">
                    <Building2 className="w-4 h-4 text-dark" />
                  </div>
                  <span className="text-base font-serif uppercase tracking-widest truncate">
                    {siteSettings.siteName}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/60 hover:text-gold transition-colors shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col p-6 gap-2 text-sm uppercase tracking-[0.2em] font-medium text-white/70">
                {[
                  { href: "#listings", label: t("properties") },
                  { href: "#about", label: t("about") },
                  { href: "#services", label: t("services") },
                  { href: "#contact", label: t("contact") },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 border-b border-white/5 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile Admin Link */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo(isAdminLoggedIn ? "/admin" : "/AdminLogin");
                  }}
                  className="py-3 border-b border-white/5 flex items-center justify-between text-gold hover:text-white transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {isAdminLoggedIn ? t("dashboard") : t("admin_login")}
                  </span>
                  {isAdminLoggedIn && (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  )}
                </button>
              </nav>

              <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-white/40">
                  {t("language")}
                </span>
                <LanguageSwitcher />
              </div>

              <div className="mt-auto p-6 flex flex-col gap-3 border-t border-white/5">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsViewingFormOpen(true);
                  }}
                  className="w-full bg-gold text-dark py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
                >
                  {t("inquiry")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Public Portfolio Content */}
      <main>
        <Hero />
        <PropertyList id="listings" />
        <Testimonials />
        <section className="py-20 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {(siteSettings.stats?.length
              ? siteSettings.stats
              : DEFAULT_SITE_SETTINGS.stats
            ).map((stat, i) => (
              <div key={i}>
                <div className="text-gold text-3xl md:text-4xl font-serif mb-2">
                  {stat.value}
                </div>
                <div className="text-white/40 text-[10px] uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
        <About id="about" />
        <section id="services" className="py-32 px-6 bg-dark">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-gold uppercase tracking-widest text-xs mb-4 block">
                {t("expertise")}
              </span>
              <h2 className="text-4xl md:text-6xl font-serif mb-6">
                {t("bespoke_services")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: t("property_acquisition"),
                  desc: t("property_acquisition_desc"),
                },
                {
                  title: t("luxury_marketing"),
                  desc: t("luxury_marketing_desc"),
                },
                {
                  title: t("portfolio_management"),
                  desc: t("portfolio_management_desc"),
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className="glass p-12 rounded-3xl hover:border-gold/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-8 border border-gold/20 group-hover:bg-gold transition-colors">
                    <div className="w-2 h-2 bg-gold group-hover:bg-dark rounded-full" />
                  </div>
                  <h3 className="text-2xl font-serif mb-4">{service.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="contact" className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-gold uppercase tracking-widest text-xs mb-4 block">
              {t("get_in_touch")}
            </span>
            <h2 className="text-5xl md:text-7xl font-serif mb-12">
              {t("start_journey")}
            </h2>
            <p className="text-white/60 text-lg mb-16 max-w-2xl mx-auto font-light">
              {t("contact_desc")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="glass p-10 rounded-3xl">
                <h3 className="text-2xl font-serif mb-6">
                  {t("contact_details")}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-white/70">
                    <Mail className="w-5 h-5 text-gold" />
                    <span>{siteSettings.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/70">
                    <Phone className="w-5 h-5 text-gold" />
                    <span>{siteSettings.contactPhone}</span>
                  </div>
                </div>
                <div className="flex gap-6 mt-12">
                  {[
                    { Icon: Instagram, href: siteSettings.socialLinks?.instagram },
                    { Icon: Linkedin, href: siteSettings.socialLinks?.linkedin },
                    { Icon: Twitter, href: siteSettings.socialLinks?.twitter },
                    { Icon: TikTokIcon, href: siteSettings.socialLinks?.tiktok },
                  ].map(({ Icon, href }, i) =>
                    href ? (
                      <a key={i} href={href} target="_blank" rel="noreferrer">
                        <Icon className="w-5 h-5 text-white/40 hover:text-gold cursor-pointer transition-colors" />
                      </a>
                    ) : (
                      <Icon
                        key={i}
                        className="w-5 h-5 text-white/40 hover:text-gold cursor-pointer transition-colors"
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="glass p-10 rounded-3xl flex flex-col justify-between">
                <h3 className="text-2xl font-serif mb-6">
                  {t("office_location")}
                </h3>
                <p className="text-white/70 leading-relaxed whitespace-pre-line">
                  {siteSettings.officeAddress}
                </p>
                <button
                  onClick={() => setIsViewingFormOpen(true)}
                  className="mt-12 w-full bg-gold text-dark py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                >
                  {t("schedule_viewing")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center flex flex-col items-center gap-3">
        <div className="text-white/20 text-[10px] uppercase tracking-[0.4em]">
          &copy; 2026 {siteSettings.siteName} {t("luxury_real_estate")}.{" "}
          {t("all_rights_reserved")}
        </div>
        <button
          type="button"
          onClick={() => navigateTo(isAdminLoggedIn ? "/admin" : "/AdminLogin")}
          className="text-[11px] uppercase tracking-widest text-white/30 hover:text-gold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Lock className="w-3 h-3" />
          <span>{isAdminLoggedIn ? t("dashboard") : t("admin_portal")}</span>
        </button>
      </footer>

      <AIChat />
      <Suspense fallback={null}>
        {hasOpenedViewingForm && (
          <ViewingForm
            isOpen={isViewingFormOpen}
            onClose={() => setIsViewingFormOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}