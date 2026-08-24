import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

/**
 * Minimal renderer for the assistant's light markdown: **bold** and
 * "- " bullet lines. Safe by construction — output is React elements,
 * never injected HTML.
 */
function renderMessageText(text: string) {
  const renderInline = (line: string, keyPrefix: string) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={`${keyPrefix}-${i}`}>{part}</span>
      ),
    );
  };

  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={key} className="space-y-1 my-1.5 pl-1">
        {bullets.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-gold shrink-0">•</span>
            <span>{renderInline(item, `${key}-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      bullets.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }
    flushBullets(`ul-${i}`);
    if (trimmed) {
      blocks.push(
        <p key={`p-${i}`} className="my-1 first:mt-0 last:mb-0">
          {renderInline(trimmed, `p-${i}`)}
        </p>,
      );
    }
  });
  flushBullets('ul-end');

  return blocks;
}

export default function AIChat() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t('ai_welcome') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, language: i18n.language }),
      });
      if (!response.ok) throw new Error('Chat request failed');

      const data = await response.json();
      const text = data.text || t('ai_error');

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: t('ai_connection_error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass fixed inset-x-3 bottom-24 top-20 sm:static sm:inset-auto sm:mb-4 sm:w-96 sm:h-[min(500px,calc(100dvh-8rem))] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gold/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-gold" />
                <span className="font-serif text-lg font-medium uppercase tracking-wider">{t('ai_assistant')}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-gold transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm break-words leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-gold text-dark font-medium rounded-tr-none' 
                      : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                  }`}>
                    {m.role === 'model' ? renderMessageText(m.text) : m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('ask_ai')}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-11 text-base sm:text-sm focus:outline-none focus:border-gold transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gold hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gold text-dark p-4 rounded-full shadow-xl flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
