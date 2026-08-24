import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language.split('-')[0];

  // Close when clicking/tapping outside the dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full border bg-white/5 ${
          isOpen
            ? 'text-gold border-gold/30'
            : 'text-white/60 hover:text-gold border-white/10 hover:border-gold/30'
        }`}
      >
        <Globe size={14} className="text-gold" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{currentLang}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 glass rounded-xl shadow-2xl py-2 z-[60] border border-white/10">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => changeLanguage(code)}
              className={`flex items-center justify-between w-full text-left px-4 py-2.5 text-xs tracking-wide hover:bg-gold/10 transition-colors ${
                currentLang === code ? 'text-gold font-bold' : 'text-white/60'
              }`}
            >
              {label}
              {currentLang === code && <Check size={12} className="text-gold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
