import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import {
  getSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '../services/propertyService';

export default function Hero() {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState(DEFAULT_SITE_SETTINGS.heroImageUrl);
  const [videoUrl, setVideoUrl] = useState(DEFAULT_SITE_SETTINGS.heroVideoUrl);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings?.heroImageUrl) {
          setImageUrl(settings.heroImageUrl);
        }
        setVideoUrl(settings?.heroVideoUrl || '');
      } catch (error) {
        console.error("Error fetching hero media:", error);
      }
    };
    fetchSettings();
  }, []);

  const showVideo = Boolean(videoUrl) && !videoFailed;

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Video / Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Image always renders underneath as poster/fallback */}
        <img 
          src={imageUrl} 
          alt="Luxury Home"
          className="w-full h-full object-cover scale-105"
          referrerPolicy="no-referrer"
        />
        {showVideo && (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/40 to-dark" />
        <div className="absolute inset-0 cinematic-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <span className="text-gold uppercase tracking-[0.2em] text-xs mb-6 block font-medium">
            ESAYAS ADAL - {t('the_real_estate_agents')}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-8 leading-tight uppercase tracking-tight">
            {t('hero_title')}
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.a
              href="#listings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gold text-dark px-10 py-4 rounded-full font-medium text-sm uppercase tracking-widest hover:bg-white transition-colors duration-500 text-center min-w-[200px]"
            >
              {t('view_details')}
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-white/30 hover:border-gold px-10 py-4 rounded-full font-medium text-sm uppercase tracking-widest backdrop-blur-sm transition-colors duration-500 text-center min-w-[200px]"
            >
              {t('contact')}
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/30"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </section>
  );
}
