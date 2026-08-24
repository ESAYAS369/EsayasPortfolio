import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTestimonials, Testimonial } from '../services/testimonialService';

export default function Testimonials() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      const data = await getTestimonials();
      setTestimonials(data);
      setLoading(false);
    }
    loadTestimonials();
  }, []);

  const next = () => {
    if (testimonials.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    if (testimonials.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <span className="text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              {t('client_experiences')}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">{t('voices_of_excellence')}</h2>
            <div className="w-12 h-1 px-1 bg-gold mx-auto" />
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass p-8 md:p-16 rounded-[2rem] border border-white/5 relative"
            >
              <Quote className="absolute top-8 left-8 w-12 h-12 text-gold/10" />
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-8 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonials[currentIndex].rating ? 'text-gold fill-gold' : 'text-white/10'}`} 
                    />
                  ))}
                </div>

                <blockquote className="text-xl md:text-2xl font-serif text-white/80 text-center leading-relaxed mb-12 italic">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/20 mb-4 bg-gold/5">
                    {testimonials[currentIndex].image ? (
                      <img 
                        src={testimonials[currentIndex].image} 
                        alt={testimonials[currentIndex].name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold font-serif text-2xl">
                        {testimonials[currentIndex].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-serif mb-1 uppercase tracking-tight">{testimonials[currentIndex].name}</div>
                    <div className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">
                      {testimonials[currentIndex].role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <>
              <button 
                onClick={prev}
                className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 p-4 glass rounded-full border border-white/5 text-white/40 hover:text-gold hover:border-gold/30 transition-all z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={next}
                className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 p-4 glass rounded-full border border-white/5 text-white/40 hover:text-gold hover:border-gold/30 transition-all z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-3 mt-12">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      i === currentIndex ? 'w-8 bg-gold' : 'w-2 bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
