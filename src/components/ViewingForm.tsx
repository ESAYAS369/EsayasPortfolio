import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Mail, Phone, MessageSquare, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { addInquiry } from '../services/propertyService';

export default function ViewingForm({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    setError(null);
    setIsSending(true);
    try {
      await addInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        date: formData.date || undefined,
        notes: formData.notes.trim() || undefined,
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', date: '', notes: '' });
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Inquiry submit error:', err);
      setError(t('inquiry_error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl glass rounded-3xl overflow-hidden shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 hover:text-gold transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-12">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8"
                  >
                    <CheckCircle2 className="w-10 h-10 text-gold" />
                  </motion.div>
                  <h2 className="text-3xl font-serif mb-4">{t('inquiry_sent')}</h2>
                  <p className="text-white/60 font-light">
                    {t('viewing_confirmation')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-10">
                    <span className="text-gold uppercase tracking-widest text-xs mb-4 block">{t('exclusive_access')}</span>
                    <h2 className="text-4xl font-serif">{t('schedule_viewing')}</h2>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t('name')}</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} maxLength={120} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors" placeholder="Abebe Kebede" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t('email')}</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} maxLength={200} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors" placeholder="john@example.com" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t('phone')}</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} maxLength={40} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors" placeholder="+251 911 234 567" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t('date')}</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t('message')}</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/20" />
                        <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} maxLength={2000} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold transition-colors resize-none" placeholder={t('tell_us_requirements')}></textarea>
                      </div>
                    </div>

                    <button type="submit" disabled={isSending} className="w-full bg-gold text-dark py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-60">
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('sendInquiry')}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
